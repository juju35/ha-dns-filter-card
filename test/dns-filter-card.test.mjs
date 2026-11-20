import assert from "node:assert/strict";
import { test } from "node:test";

// Objects built inside the card's vm context are not reference-equal to ours: compare their JSON.
const eq = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);
import { load } from "./load.mjs";
import { adguard, pihole, technitium } from "../scripts/mock-states.mjs";

const { discover, listDevices, protectionOf, versionsOf, fmtShort, fmtPct, hms, DnsFilterCard, DnsFilterMiniCard, DnsFilterCardEditor, DnsFilterMiniCardEditor, STRINGS, spark, histPoints, dnsfIsNight, dnsfSceneSvg, window: win } = load(
  "dns-filter-card.js",
  ["discover", "listDevices", "protectionOf", "versionsOf", "fmtShort", "fmtPct", "hms", "DnsFilterCard", "DnsFilterMiniCard", "DnsFilterCardEditor", "DnsFilterMiniCardEditor", "STRINGS", "spark", "histPoints", "dnsfIsNight", "dnsfSceneSvg", "window"]
);

const hassOf = (...mocks) => {
  const h = { states: {}, entities: {}, devices: {}, language: "en" };
  for (const m of mocks) {
    Object.assign(h.states, m.states);
    Object.assign(h.entities, m.entities);
    Object.assign(h.devices, m.devices);
  }
  return h;
};

test("AdGuard Home entities are mapped by translation_key", () => {
  const dev = discover(hassOf(adguard), "");
  assert.equal(dev.brand, "adguard");
  assert.equal(dev.deviceId, "adguard_home_1");
  assert.equal(dev.e.queries, "sensor.adguard_home_dns_queries");
  assert.equal(dev.e.ratio, "sensor.adguard_home_dns_queries_blocked_ratio");
  assert.equal(dev.e.protection, "switch.adguard_home_protection");
  assert.equal(dev.e.query_log, "switch.adguard_home_query_log");
  assert.equal(dev.e.update_core, "update.adguard_home_update");
});

test("Pi-hole entities are mapped, the blocking switch without translation_key", () => {
  const dev = discover(hassOf(pihole), "");
  assert.equal(dev.brand, "pihole");
  assert.equal(dev.e.queries, "sensor.pi_hole_dns_queries");
  assert.equal(dev.e.domains, "sensor.pi_hole_domains_blocked");
  assert.equal(dev.e.status, "binary_sensor.pi_hole_status");
  assert.equal(dev.e.protection, "switch.pi_hole");
  assert.equal(dev.e.update_ftl, "update.pi_hole_ftl_update_available");
});

test("the configured device picks its integration; both instances are listed for the editor", () => {
  const hass = hassOf(adguard, pihole);
  assert.equal(discover(hass, "pi_hole_1").brand, "pihole");
  assert.equal(discover(hass, "adguard_home_1").brand, "adguard");
  assert.equal(discover(hass, "").brand, "adguard");
  assert.equal(discover(hass, "nope").deviceId, null);
  eq(
    listDevices(hass).map((o) => o.label),
    ["AdGuard Home · AdGuard Home", "Pi-hole · Pi-hole"]
  );
});

test("protection state: AdGuard switch, Pi-hole status binary sensor", () => {
  const ha = hassOf(adguard, pihole);
  eq(protectionOf(ha, discover(ha, "adguard_home_1")), { id: "switch.adguard_home_protection", state: "on" });
  ha.states["binary_sensor.pi_hole_status"] = { ...ha.states["binary_sensor.pi_hole_status"], state: "off" };
  eq(protectionOf(ha, discover(ha, "pi_hole_1")), { id: "binary_sensor.pi_hole_status", state: "off" });
  ha.states["binary_sensor.pi_hole_status"] = { ...ha.states["binary_sensor.pi_hole_status"], state: "unavailable" };
  assert.equal(protectionOf(ha, discover(ha, "pi_hole_1")).state, "unavailable");
});

test("versions come from the update entities, with the pending update", () => {
  const ha = hassOf(pihole);
  const v = versionsOf(ha, discover(ha, ""));
  eq(
    v.map((x) => [x.label, x.version, x.update]),
    [
      ["Core", "6.0.6", null],
      ["FTL", "6.1", "6.2.1"],
      ["Web", "6.1", null],
    ]
  );
  // Without update entities, the device's software version.
  const h2 = hassOf(adguard);
  delete h2.states["update.adguard_home_update"];
  eq(versionsOf(h2, discover(h2, "")), [{ label: "AdGuard Home", version: "v0.107.63", id: null, update: null }]);
});

test("number formats", () => {
  assert.equal(fmtShort(2749968, "en"), "2.7M");
  assert.equal(fmtShort(91654, "en"), "91.7k");
  assert.equal(fmtShort(101165, "en"), "101k");
  assert.equal(fmtShort(312, "en"), "312");
  assert.equal(fmtShort(null, "en"), "—");
  assert.equal(fmtPct(26.08, "en"), "26%");
  assert.equal(fmtPct(7.44, "fr"), "7,4%");
  assert.equal(hms(5), "00:05:00");
  assert.equal(hms(120), "02:00:00");
});

test("full card renders the four tiles, the switches and the update chip", () => {
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = hassOf(adguard);
  const html = el._render();
  assert.match(html, /DNS queries/);
  assert.match(html, />91,654</);
  assert.match(html, /Processing time/);
  assert.match(html, />7\.4 ms</);
  assert.match(html, /data-action="toggle" data-entity="switch\.adguard_home_parental_control" aria-pressed="false"/);
  assert.match(html, /Update available · AdGuard Home v0\.107\.64/);
  assert.match(html, /data-action="refresh"/);
  assert.doesNotMatch(html, /data-action="pause"/);
});

test("Pi-hole full card shows the domains tile, the pause button and the three versions", () => {
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = hassOf(pihole);
  const html = el._render();
  assert.match(html, /Domains on lists/);
  assert.match(html, />2,749,968</);
  assert.match(html, /data-action="pause"/);
  assert.match(html, /Core <b>6\.0\.6<\/b>/);
  assert.doesNotMatch(html, /data-action="refresh"/);
  // Blocking paused: the resume button and the paused pill.
  el._hass.states["binary_sensor.pi_hole_status"] = { ...el._hass.states["binary_sensor.pi_hole_status"], state: "off" };
  el._hass.states["switch.pi_hole"] = { ...el._hass.states["switch.pi_hole"], state: "off" };
  const paused = el._render();
  assert.match(paused, /data-action="resume"/);
  assert.match(paused, /Paused/);
});

test("mini card: three short tiles, the ratio bar and the status pill after the title", () => {
  const el = new DnsFilterMiniCard();
  el._config = {};
  el._hass = hassOf(pihole);
  const html = el._render();
  assert.match(html, />101k</);
  assert.match(html, />24k</);
  assert.match(html, /width:23\.74%/);
  assert.match(html, /<div class="trow"><div class="name">[^<]+<\/div><span class="chip clickable ok" role="button" tabindex="0" data-action="protection"[^>]*><span class="dot"><\/span><span class="txt">Protection on<\/span>/);
  assert.doesNotMatch(html, /data-key="status"/, "not repeated in the footer");
  for (const illustration of [false, true]) {
    el._config = { illustration };
    assert.match(el._render(), /class="chip clickable ok"[^>]*data-action="protection"/, `pill in the header (illustration: ${illustration})`);
  }
  el._config = {};
  assert.doesNotMatch(html, /Domains on lists/);
  // Zoomed: the full card's content.
  el._zoomed = true;
  assert.match(el._render(), /Domains on lists/);
});

test("without any instance the card shows a setup warning, a wrong device its id", () => {
  const el = new DnsFilterCard();
  el._hass = { states: {}, entities: {}, devices: {}, language: "en" };
  el._config = {};
  assert.match(el._render(), /No AdGuard Home, Pi-hole or Technitium DNS entities found/);
  el._config = { device: "abc" };
  assert.match(el._render(), /DNS filter not found: abc/);
});

test("pause services: a duration goes through pi_hole.disable, « until resumed » through the switch", () => {
  const calls = [];
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = { ...hassOf(pihole), callService: (d, s, data) => calls.push([d, s, data]) };
  el._pause(30);
  el._pause(0);
  el._resume();
  return new Promise((r) => setTimeout(r, 0)).then(() =>
    eq(calls, [
      ["pi_hole", "disable", { entity_id: "switch.pi_hole", duration: "00:30:00" }],
      ["switch", "turn_off", { entity_id: "switch.pi_hole" }],
      ["switch", "turn_on", { entity_id: "switch.pi_hole" }],
    ])
  );
});

test("the render is skipped while nothing shown has changed", () => {
  const el = new DnsFilterCard();
  el.setConfig({});
  let renders = 0;
  el._update = (sig) => {
    renders++;
    el._sig = sig ?? el._signature();
  };
  const h1 = hassOf(adguard);
  el.hass = h1;
  el.hass = { ...h1 }; // same states and registries
  assert.equal(renders, 1);
  el.hass = { ...h1, states: { ...h1.states, "sensor.adguard_home_dns_queries": { ...h1.states["sensor.adguard_home_dns_queries"], state: "1" } } };
  assert.equal(renders, 2);
});

test("sparkline follows the time axis and breaks on gaps", () => {
  const now = 1_700_000_000_000;
  const period = 5 * 60000;
  const pts = histPoints([
    { start: now - 3 * period, mean: 1 },
    { start: now - 2 * period, mean: 2 },
    { start: now - 20 * period, mean: 3 },
  ]);
  assert.equal(pts.length, 3);
  assert.equal(spark([pts[0]], now), "");
  const svg = spark([pts[2], pts[0], pts[1]], now);
  assert.match(svg, /class="spark-l" d="M[^"]*"/);
  assert.equal((svg.match(/d="M/g) || []).length, 2); // one area path, one line path
});

test("every language carries every English string", () => {
  const keys = Object.keys(STRINGS.en);
  for (const [l, s] of Object.entries(STRINGS)) {
    assert.deepEqual(Object.keys(s).sort(), [...keys].sort(), `${l} strings`);
    for (const k of keys) assert.ok(String(s[k]).trim(), `${l}.${k} is empty`);
  }
  assert.equal(Object.keys(STRINGS).length, 22);
});

test("the status pill is a blocking control, not a more-info", () => {
  const calls = [];
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = { ...hassOf(adguard), callService: (d, s, data) => calls.push([d, s, data]) };
  const html = el._render();
  assert.match(html, /class="chip clickable ok" role="button" tabindex="0" data-action="protection"/);
  assert.doesNotMatch(html, /data-action="protection"[^>]*data-entity=/);
  el._protectionClick();
  // Pi-hole, blocking on: the pause popup opens instead of a service call.
  const pi = new DnsFilterCard();
  pi._config = {};
  pi._hass = { ...hassOf(pihole), callService: (d, s, data) => calls.push([d, s, data]) };
  pi._update = () => {};
  pi._protectionClick();
  assert.equal(pi._dialog, true);
  return new Promise((r) => setTimeout(r, 0)).then(() =>
    eq(calls, [["switch", "toggle", { entity_id: "switch.adguard_home_protection" }]])
  );
});

test("Technitium DNS: its server's entities by their fixed names, the ratio worked out, its pause buttons; DHCP clients left out", () => {
  const hass = hassOf(technitium);
  const dev = discover(hass);
  assert.equal(dev.brand, "technitium");
  assert.equal(dev.deviceId, "technitium_1");
  eq(dev.e, {
    queries: "sensor.technitium_total_queries",
    blocked: "sensor.technitium_blocked_queries",
    clients: "sensor.technitium_clients",
    cached: "sensor.technitium_total_cached",
    forwarded: "sensor.technitium_total_recursive",
    domains: "sensor.technitium_blocked_zones",
    protection: "switch.technitium_enable_ad_blocking",
  });
  eq(listDevices(hass), [{ value: "technitium_1", label: "Technitium DNS · Technitium" }]);
  const calls = [];
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = { ...hass, callService: (d, s, data) => calls.push([d, s, data]) };
  const html = el._render();
  assert.match(html, /data-key="ratio" data-entity="sensor\.technitium_blocked_queries"[\s\S]*?>20%</);
  assert.match(html, /data-action="pause"/);
  el._dialog = true;
  const minutes = [...el._dialogHtml().matchAll(/data-minutes="(\d+)"/g)].map((m) => Number(m[1]));
  eq(minutes, [5, 30, 1440, 0]);
  el._dialog = null;
  el._pause(30);
  el._pause(0);
  return new Promise((r) => setTimeout(r, 0)).then(() =>
    eq(calls, [
      ["button", "press", { entity_id: "button.technitium_disable_ad_blocking_for_30_minutes" }],
      ["switch", "turn_off", { entity_id: "switch.technitium_enable_ad_blocking" }],
    ])
  );
});

test("Technitium DNS: a server whose model was renamed is still found by its total queries sensor, DHCP clients still left out", () => {
  const hass = hassOf(technitium);
  hass.devices = { ...hass.devices, technitium_1: { ...hass.devices.technitium_1, model: "Technitium DNS Server v14" } };
  eq(listDevices(hass), [{ value: "technitium_1", label: "Technitium DNS · Technitium" }]);
  assert.equal(discover(hass).e.queries, "sensor.technitium_total_queries");
});

test("the card picker names Technitium DNS beside AdGuard Home and Pi-hole", () => {
  const cards = win.customCards.filter((c) => c.type.startsWith("dns-filter"));
  assert.equal(cards.length, 2);
  for (const c of cards) assert.match(c.description, /Technitium DNS/);
});

test("entities: sensors of the user's choice replace the slots found", () => {
  const hass = hassOf(pihole);
  hass.states["sensor.my_ratio"] = { entity_id: "sensor.my_ratio", state: "50", attributes: {} };
  const el = new DnsFilterCard();
  el._config = { entities: { ratio: "sensor.my_ratio", queries: "not an id" } };
  el._hass = hass;
  const dev = el._dev();
  assert.equal(dev.e.ratio, "sensor.my_ratio");
  assert.equal(dev.e.queries, "sensor.pi_hole_dns_queries");
  assert.equal(el._dev(), dev);
  assert.match(el._render(), /data-entity="sensor\.my_ratio"/);
});

test("folding: a tap elsewhere (pointer), not a press inside released outside; leaving the page closes back", () => {
  const pi = new DnsFilterCard();
  pi._config = {};
  pi._hass = { ...hassOf(pihole), callService() {} };
  pi._update = () => {};
  pi.connectedCallback();
  pi._protectionClick();
  assert.equal(pi._dialog, true);
  // Pressed in the card and released outside: the popup stays.
  pi._dialogOutside.tap({ composedPath: () => [pi] });
  assert.equal(pi._dialog, true);
  // A tap in a Home Assistant dialog does not close it either.
  pi._dialogOutside.tap({ composedPath: () => [{ localName: "ha-more-info-dialog" }] });
  assert.equal(pi._dialog, true);
  // A tap on a spot that sends no click (iOS): the pointer alone closes it.
  pi._dialogOutside.tap({ composedPath: () => [] });
  assert.ok(!pi._dialog);
  // Left with the popup open and back: closed.
  pi._protectionClick();
  pi.disconnectedCallback();
  pi.connectedCallback();
  assert.ok(!pi._dialog);
  pi.disconnectedCallback();
  // The mini card comes back compact; the tap that closes its popup does not unzoom it.
  const mini = new DnsFilterMiniCard();
  mini._config = {};
  mini._hass = { ...hassOf(pihole), callService() {} };
  mini._update = () => {};
  mini.connectedCallback();
  mini._zoomed = true;
  mini._protectionClick();
  const tap = { composedPath: () => [] };
  mini._dialogOutside.tap(tap);
  mini._unzoom.tap(tap);
  assert.ok(!mini._dialog);
  assert.equal(mini._zoomed, true);
  mini._unzoom.tap({ composedPath: () => [] });
  assert.equal(mini._zoomed, false);
  mini._zoomed = true;
  mini.disconnectedCallback();
  mini.connectedCallback();
  assert.equal(mini._zoomed, false);
  mini.disconnectedCallback();
});

test("no update under a press: the click renders at once, a release without a click draws what was held", async () => {
  const el = new DnsFilterCard();
  el._config = {};
  el.hass = { ...hassOf(pihole), callService() {} };
  el.connectedCallback();
  const html = () => el.shadowRoot.innerHTML;
  const before = html();
  el._pressing = true;
  el.hass = { ...hassOf(pihole), language: "fr", callService() {} };
  assert.equal(html(), before, "no update under the pointer");
  // A click that changes the card (the pause popup of Pi-hole): drawn at once, with the update held back.
  for (const fn of el.shadowRoot.listeners.click) fn({ composedPath: () => [{ dataset: { action: "protection" } }], stopPropagation() {}, stopImmediatePropagation() {} });
  assert.equal(el._dialog, true);
  assert.notEqual(html(), before, "the click renders at once");
  el._closeDialog(false);
  // Pressed and released elsewhere (no click): the held update is drawn after the release.
  const held = html();
  el._pressing = true;
  el.hass = { ...hassOf(pihole), callService() {} };
  assert.equal(html(), held);
  el._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.notEqual(html(), held);
  el.disconnectedCallback();
});

test("editors: the mini card offers every option of the full card its detailed view uses, plus zoom", () => {
  const schemaOf = (Editor) => {
    const ed = new Editor();
    ed._hass = hassOf(adguard);
    ed._config = {};
    return JSON.stringify(ed._schema());
  };
  const full = schemaOf(DnsFilterCardEditor);
  const mini = schemaOf(DnsFilterMiniCardEditor);
  for (const n of ["device", "title", "url", "illustration", "illustration_theme", "show_title", "show_subtitle", "show_stats", "show_details", "show_switches", "show_history", "show_versions", "language"]) {
    assert.match(full, new RegExp(`"${n}"`), `full: ${n}`);
    assert.match(mini, new RegExp(`"${n}"`), `mini: ${n}`);
  }
  assert.match(mini, /"zoom"/);
  assert.doesNotMatch(full, /"zoom"/);
  // `entities` (an object of overrides) stays YAML only.
  assert.doesNotMatch(full + mini, /"entities"/);
  // Every option of the editors has a label in every language.
  for (const [code, strings] of Object.entries(STRINGS)) for (const n of DnsFilterMiniCardEditor.toggles) assert.ok(strings[n], `${code}: ${n}`);
});

test("the illustration follows illustration_theme, then the dark mode alone", () => {
  const sun = (state) => ({ states: { "sun.sun": { state } }, themes: { darkMode: false } });
  // A light theme keeps the day picture after sunset.
  assert.equal(dnsfIsNight(sun("below_horizon"), {}), false);
  assert.equal(dnsfIsNight(sun("above_horizon"), {}), false);
  assert.equal(dnsfIsNight(sun("below_horizon"), { illustration_theme: "day" }), false);
  assert.equal(dnsfIsNight(sun("above_horizon"), { illustration_theme: "night" }), true);
  assert.equal(dnsfIsNight({ states: {}, themes: { darkMode: true } }, {}), true);
  assert.equal(dnsfIsNight(sun("unavailable"), {}), false);
  const darkSunUp = { states: { "sun.sun": { state: "above_horizon" } }, themes: { darkMode: true } };
  assert.equal(dnsfIsNight(darkSunUp, {}), true, "dark theme while the sun is up: night");
  assert.equal(dnsfIsNight(darkSunUp, { illustration_theme: "day" }), false);
  assert.equal(dnsfIsNight({ states: { "sun.sun": { state: "unavailable" } }, themes: { darkMode: true } }, {}), true);
  for (const [code, strings] of Object.entries(STRINGS))
    for (const k of ["illustration_theme", "theme_auto", "theme_day", "theme_night", "blocked_n"]) assert.ok(strings[k], `${code}: ${k}`);
});

test("the banner picture shows the protection state and the blocked count", () => {
  const on = dnsfSceneSvg("on", "23.9k");
  assert.match(on, /dnsf-x/);
  assert.match(on, /23\.9k/);
  assert.match(on, /g-net/);
  const off = dnsfSceneSvg("off", "23.9k");
  assert.doesNotMatch(off, /dnsf-x|dnsf-count/);
  assert.doesNotMatch(dnsfSceneSvg("na", ""), /dnsf-x|dnsf-count/);
  // No ids: several cards on one page never clash.
  assert.doesNotMatch(on, /\sid="/);
});

test("editor: a state change only passes the new hass to the form, the schema is rebuilt on a new language", () => {
  const ed = new DnsFilterCardEditor();
  const h = hassOf(adguard);
  ed.setConfig({});
  ed.hass = h;
  const schema = ed._form.schema;
  // A state change: same language, same registries.
  const h2 = { ...h, states: { ...h.states } };
  ed.hass = h2;
  assert.equal(ed._form.hass, h2);
  assert.equal(ed._form.schema, schema, "schema kept");
  ed.hass = { ...h2, language: "fr" };
  assert.notEqual(ed._form.schema, schema, "schema rebuilt for the new language");
});

test("mini card: the detail button has an accessible name", () => {
  const el = new DnsFilterMiniCard();
  el._config = {};
  el._hass = hassOf(adguard);
  assert.match(el._zoomButton(), /type="button" class="zoom" title="[^"]+" aria-label="[^"]+"/);
});
