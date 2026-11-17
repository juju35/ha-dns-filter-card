// Renders the cards with mock AdGuard Home and Pi-hole data and saves the README screenshots.
// Usage: npm run build && npm run screenshots
// Then records the banner animations into screenshots/*.gif, light and dark (needs ffmpeg).
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mocks } from "./mock-states.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/dns-filter-card.js`, "utf8");

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const pageHtml = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme]).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// Opens a fresh page for one shot and mounts the card with the mock hass of its brand.
async function openCard(browser, s) {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
  page.on("pageerror", (err) => console.error(`${s.file}: ${err.message}`));
  await page.setContent(pageHtml(s.theme, s.width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, mock, dark, zoom, pause, pihole }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      // Recorder statistics, one 5-minute period after the other up to now: a plausible 24 h curve for each
      // counter (busy evening, quiet night), deterministic so the captures compare exactly.
      const mean = (i, k) => 40 + 60 * Math.exp(-((i - 230 + k * 15) ** 2) / 900) + 25 * Math.exp(-((i - 110) ** 2) / 500) + 8 * Math.sin(i * 0.11 + k) ** 2;
      // Pi-hole's counters carry no state_class, so the recorder keeps no statistics for them: no curves.
      const callWS = async (msg) =>
        Object.fromEntries(
          (pihole ? [] : msg.statistic_ids || []).map((id, k) => [
            id,
            Array.from({ length: 288 }, (_, i) => ({ start: Date.now() - (288 - i) * 300000, mean: mean(i, k) })),
          ])
        );
      el.hass = { ...mock, language: "en", locale: { language: "en" }, themes: { darkMode: dark }, callWS, callService: async () => {} };
      document.getElementById("root").appendChild(el);
      if (zoom)
        el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
      if (pause) {
        el.shadowRoot.querySelector('[data-action="pause"]').dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        el.shadowRoot.activeElement?.blur(); // a mouse user sees no focus ring on the first duration
      }
    },
    { type: s.type, config: s.config, mock: s.hass || mocks[s.mock], dark: s.theme === "dark", zoom: !!s.zoom, pause: !!s.pause, pihole: s.mock !== "adguard" }
  );
  return page;
}

const shots = [];
for (const mock of ["adguard", "pihole", "technitium"]) {
  for (const theme of ["light", "dark"]) {
    const sfx = theme === "dark" ? "-dark" : "";
    shots.push({ file: `card-${mock}${sfx}`, type: "dns-filter-card", theme, width: 460, config: {}, mock });
    shots.push({ file: `mini-card-${mock}${sfx}`, type: "dns-filter-mini-card", theme, width: 380, config: {}, mock });
  }
}
for (const theme of ["light", "dark"]) {
  const sfx = theme === "dark" ? "-dark" : "";
  shots.push({ file: `mini-card-zoom${sfx}`, type: "dns-filter-mini-card", theme, width: 460, config: {}, mock: "adguard", zoom: true });
  shots.push({ file: `pause${sfx}`, type: "dns-filter-card", theme, width: 460, config: {}, mock: "pihole", pause: true });
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

// A screenshot is only rewritten when its pixels change: two encodings of the same image differ in bytes, not on
// screen. The browser decodes both PNGs and compares their pixels.
const decoder = await browser.newPage();
const samePixels = (a, b) =>
  decoder.evaluate(
    async ([a, b]) => {
      const pixels = async (b64) => {
        const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        return { w: bmp.width, h: bmp.height, d: ctx.getImageData(0, 0, bmp.width, bmp.height).data };
      };
      const [x, y] = await Promise.all([pixels(a), pixels(b)]);
      return x.w === y.w && x.h === y.h && x.d.every((v, i) => v === y.d[i]);
    },
    [a.toString("base64"), b.toString("base64")]
  );
const savePng = async (path, png) => {
  if (existsSync(path) && (await samePixels(readFileSync(path), png))) return console.log(`${path.slice(root.length)} (unchanged)`);
  writeFileSync(path, png);
  console.log(path.slice(root.length));
};

for (const s of shots) {
  const page = await openCard(browser, s);
  await page.waitForTimeout(800);
  const box = await page.locator("#root").boundingBox();
  const png = await page.screenshot({
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  await savePng(`${root}screenshots/${s.file}.png`, png);
  await page.close();
}
// Animated captures: the banner of the full card, one GIF per state, light and dark. The CSS animations are paused
// and stepped frame by frame over one 4 s cycle (every animation of the banner divides it), so each GIF loops
// cleanly at its real speed whatever the machine's speed.
const FPS = 15;
const PERIOD = 4000;
const protectionOff = structuredClone(mocks.adguard);
protectionOff.states["switch.adguard_home_protection"].state = "off";
const GIFS = [
  // Protection on: the good requests pass, the bad ones are stopped at the shield, the red cross blinks.
  { name: "anim-protection-on", config: { illustration_theme: "day" } },
  // Protection off (or paused): every request goes through the open amber shield.
  { name: "anim-protection-off", config: { illustration_theme: "day" }, hass: protectionOff },
  // Night: the same flow on the night picture.
  { name: "anim-night", config: { illustration_theme: "night" } },
];

// Pauses every CSS animation of the page (shadow trees walked by hand) at `frac` of the cycle.
const freeze = (page, frac) =>
  page.evaluate(
    ({ f, period }) => {
      const walk = (node) =>
        [...node.querySelectorAll("*")].flatMap((el) => [...el.getAnimations(), ...(el.shadowRoot ? walk(el.shadowRoot) : [])]);
      for (const a of walk(document)) {
        a.pause();
        a.currentTime = (3 + f) * period;
      }
    },
    { f: frac, period: PERIOD }
  );

// Every decoded frame (RGBA) and its timing, as ffmpeg's per-frame MD5 list: equal lists, same animation.
const decodedFrames = (file) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-pix_fmt", "rgba", "-f", "framemd5", "-"], { encoding: "utf8" })
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .join("\n");

// A deterministic GIF (palette from the frames only, ordered dithering, bit-exact muxing), replacing the file in
// place only when its decoded frames differ.
const encodeGif = (dir, file, width) => {
  const gif = join(dir, "out.gif");
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(dir, "f%03d.png"),
    "-vf", `scale=${width + 32}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-fflags", "+bitexact", "-flags", "+bitexact", "-loop", "0", gif,
  ]);
  const target = `${root}screenshots/${file}.gif`;
  const same = existsSync(target) && decodedFrames(target) === decodedFrames(gif);
  if (!same) copyFileSync(gif, target);
  console.log(`screenshots/${file}.gif${same ? " (unchanged)" : ""}`);
};

for (const g of GIFS) {
  for (const theme of ["light", "dark"]) {
    const file = `${g.name}${theme === "dark" ? "-dark" : ""}`;
    const s = { file, type: "dns-filter-card", theme, width: 460, config: g.config, mock: "adguard", hass: g.hass };
    const page = await openCard(browser, s);
    await page.waitForTimeout(800);
    // The banner with the 16 px of theme background around the card.
    const bottom = await page.evaluate(() => document.querySelector("#root > *").shadowRoot.querySelector(".banner").getBoundingClientRect().bottom);
    const clip = { x: 0, y: 0, width: s.width + 32, height: Math.ceil(bottom) };
    const dir = mkdtempSync(join(tmpdir(), "dnsf-frames-"));
    const frames = Math.round((FPS * PERIOD) / 1000);
    for (let i = 0; i < frames; i++) {
      await freeze(page, i / frames);
      await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
    }
    encodeGif(dir, file, s.width);
    rmSync(dir, { recursive: true });
    await page.close();
  }
}
await browser.close();
