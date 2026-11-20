// Browser test (Chromium through Playwright): the card does not move the dashboard. A state change of an entity the
// card does not show writes nothing in its shadow DOM; a change of its own entities patches it in place (no node
// replaced, its pictures and icons kept) and its height stays the same on every animation frame, so the sections
// grid never reflows under the user. Skipped when Playwright or Chromium is not installed, except in CI, where it
// must run. CHROMIUM_PATH points to a local Chromium if needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { adguard, pihole } from "../scripts/mock-states.mjs";
const src = readFileSync(new URL("../src/dns-filter-card.js", import.meta.url), "utf8");

let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

// Like Home Assistant's <ha-card> (a Lit element): its content shows from its first update only, a microtask after it
// is connected (hasUpdated / updateComplete as Lit's), so whatever is measured before that is 0 px wide.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style>"; }
  connectedCallback() {
    if (this.updateComplete) return;
    this.hasUpdated = false;
    this.updateComplete = Promise.resolve().then(() => { this.shadowRoot.appendChild(document.createElement("slot")); this.hasUpdated = true; return true; });
  }
});`;
const STUBS = HA_CARD;
let MOCK = adguard;
const HASS = () => ({ ...MOCK, states: { ...MOCK.states }, language: "en", locale: { language: "en" }, themes: {} });

// Mounts the card, then sends 20 hass updates (even: an unrelated entity, odd: the card's own entities, through
// `mutate`) and records the card's height on every frame and the shadow DOM's mutations of each kind of update.
const probe = async (tag, config, width) => {
  const page = await browser.newPage({ viewport: { width: 800, height: 1400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(`<!doctype html><body style="margin:0"><div id="root" style="width:${width}px"></div></body>`);
  if (STUBS) await page.addScriptTag({ content: STUBS });
  await page.addScriptTag({ content: src });
  const r = await page.evaluate(
    async ({ tag, config, hass, mutate }) => {
      const frames = (n) => new Promise((done) => { const f = (k) => (k ? requestAnimationFrame(() => f(k - 1)) : done()); f(n); });
      const el = document.createElement(tag);
      el.setConfig({ type: `custom:${tag}`, ...config });
      hass.callWS = () => new Promise(() => {});
      hass.callService = async () => {};
      el.hass = hass;
      document.getElementById("root").appendChild(el);
      // The height and the status pill's place on each of the first frames, then once settled: the same.
      const look = () => `${Math.round(el.getBoundingClientRect().height)} ${[...el.shadowRoot.querySelectorAll(".titles")].map((t) => t.className).join("|")}`;
      const first = new Set();
      for (let k = 0; k < 6; k++) {
        await frames(1);
        first.add(look());
      }
      await new Promise((done) => setTimeout(done, 300));
      await frames(3);
      const settled = look();
      const step = new Function("states", "i", mutate);
      const counts = { unrelated: 0, removed: 0 };
      let kind = "unrelated";
      const count = (list) => {
        for (const m of list) {
          if (kind === "unrelated") counts.unrelated++;
          else if (m.type === "childList") counts.removed += [...m.removedNodes].filter((n) => n.nodeType === 1).length;
        }
      };
      const mo = new MutationObserver(count);
      const media = [...el.shadowRoot.querySelectorAll("img, svg")];
      mo.observe(el.shadowRoot, { subtree: true, childList: true, attributes: true, characterData: true });
      const heights = new Set();
      let run = true;
      const tick = () => {
        heights.add(Math.round(el.getBoundingClientRect().height));
        if (run) requestAnimationFrame(tick);
      };
      tick();
      let h = hass;
      for (let i = 0; i < 20; i++) {
        kind = i % 2 ? "related" : "unrelated";
        const states = { ...h.states };
        if (kind === "unrelated") states["sensor.layout_probe"] = { entity_id: "sensor.layout_probe", state: String(i), attributes: {} };
        else step(states, i);
        h = { ...h, states };
        el.hass = h;
        count(mo.takeRecords());
        await frames(2);
      }
      run = false;
      mo.disconnect();
      return { ...counts, first: [...first], settled, heights: [...heights], mediaKept: media.every((n) => n.isConnected), media: media.length };
    },
    { tag, config, hass: HASS(), mutate: MUTATE }
  );
  await page.close();
  return { ...r, errors };
};

const MUTATE = `const bump = (re, f) => { const id = Object.keys(states).find((k) => re.test(k)); states[id] = { ...states[id], state: String(f(Number(states[id].state))) }; };
bump(/^sensor..*_dns_queries$/, (v) => v + 1 + i * 997);
bump(/^sensor..*(blocked_ratio|percentage_blocked)$/, () => (20 + ((i * 1.37) % 9)).toFixed(2));`;

const CASES = [["dns-filter-mini-card", { _mock: adguard }, 260], ["dns-filter-mini-card", { _mock: pihole }, 480], ["dns-filter-card", { _mock: adguard }, 300], ["dns-filter-card", { _mock: pihole }, 480]];
// The pill beside the title or under it, depending on the width and the server (its own name and status).
for (const tag of ["dns-filter-mini-card", "dns-filter-card"]) for (const width of [300, 400]) CASES.push([tag, { _mock: adguard }, width], [tag, { _mock: pihole }, width]);
for (const [tag, { _mock, ...config }, width] of CASES) {
  test(`${tag} (${_mock === pihole ? "Pi-hole" : "AdGuard Home"}) at ${width} px: pill placed from the first frame, no write on unrelated updates, patched in place, constant height`, async (t) => {
    if (skip) return t.skip(skip);
    MOCK = _mock;
    const r = await probe(tag, config, width);
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.first, [r.settled], "the first frames show the pill where it settles, at the same height");
    assert.equal(r.unrelated, 0, "an unrelated state change writes nothing");
    assert.equal(r.removed, 0, "no element replaced by an update of the card's own entities");
    assert.ok(r.media > 0 && r.mediaKept, "the pictures and icons are kept");
    assert.equal(r.heights.length, 1, `one height on every frame, got ${r.heights}`);
  });
}
