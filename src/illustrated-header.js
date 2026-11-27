// ---------------------------------------------------------------------------
// Illustrated header
// ---------------------------------------------------------------------------
//
// A 200 × 80 picture at the right of the 90 px banner, over a 10 px network strip edge to edge: DNS requests run
// along a pipe through the shield. Protection on: the good ones (green) pass, the bad ones (red) are stopped at the
// shield and the counter shows how many were blocked. Off or paused: every request goes through an open shield.
// Unavailable: nothing flows. The picture carries no ids, so several cards on a page never clash.
import { esc } from "./helpers.js";

export const DNSF_PACKETS = [
  [0, "good", 20],
  [1, "bad", 50],
  [2, "good", 80],
  [3, "good", 110],
  [4, "bad", 140],
  [5, "good", 160],
];
export const dnsfSceneSvg = (st, count) => {
  const grid = [
    ...Array.from({ length: 19 }, (_, i) => `M${(i + 1) * 10} 0V80`),
    ...Array.from({ length: 7 }, (_, i) => `M0 ${(i + 1) * 10}H200`),
  ].join("");
  const mark =
    st === "on"
      ? `<path class="dnsf-mark" d="M-7 -1l5 5l9 -10"/>`
      : st === "off"
        ? `<path class="dnsf-mark" d="M-8 -9L8 7"/>`
        : `<path class="dnsf-mark" d="M-6 -1H6"/>`;
  const packets = DNSF_PACKETS.map(
    ([i, kind, x]) => `<rect class="dnsf-p p${i} ${kind}" style="--x:${x}px" x="12" y="41" width="8" height="6" rx="1.5"/>`
  ).join("");
  const tw = count.length * 4.4;
  const counter =
    st === "on" && count
      ? `<g class="dnsf-count" transform="translate(190 64)"><rect x="${-tw - 13}" y="-6" width="${tw + 17}" height="12" rx="6"/><circle cx="${-tw - 7}" cy="0" r="2.6"/><path d="M${-tw - 8.8} 1.8l3.6 -3.6"/><text x="0" y="2.6" text-anchor="end">${esc(count)}</text></g>`
      : "";
  return `<svg class="dnsf-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
    <g>
      <path class="dnsf-grid" d="${grid}"/>
      <path class="dnsf-pipe" d="M14 44H190"/>
      <g class="dnsf-pkts">${packets}</g>
    </g>
    <g transform="translate(120 44)"><path class="dnsf-shield" d="M0 -26L-18 -19V-6C-18 8 -9 18 0 22C9 18 18 8 18 -6V-19Z"/>${mark}</g>
    ${st === "on" ? `<g class="dnsf-x" transform="translate(96 30)"><circle r="6"/><path d="M-3 -3l6 6M3 -3l-6 6"/></g>` : ""}
    ${counter}
  </svg><div class="g-net"></div>`;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
export const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const dnsfIsNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The banner: background, picture, network strip, and the icon and titles on its left. Colours and animations day
// and night; the requests stop moving under prefers-reduced-motion.
export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; color: #10283f; background: #eef2f8; }
  .banner.night { color: #fff; background: #1f2633; }
  .dnsf-scene { position: absolute; right: 0; bottom: 10px; width: var(--dnsf-scene-w, 200px); height: 80px;
                -webkit-mask-image: linear-gradient(90deg, transparent, #000 30%); mask-image: linear-gradient(90deg, transparent, #000 30%); }
  .dnsf-grid { fill: none; stroke: #dde5ef; stroke-width: .6; } .night .dnsf-grid { stroke: #2a3446; }
  .dnsf-pipe { fill: none; stroke: #c4cdd8; stroke-width: 6; stroke-linecap: round; } .night .dnsf-pipe { stroke: #3a4456; }
  .st-na .dnsf-pipe { stroke-dasharray: 6 5; }
  .dnsf-p.good { fill: #43a047; } .dnsf-p.bad { fill: #e5484d; }
  /* At rest (no animation) the requests are spread along the pipe, the bad ones stopped at the shield. */
  .dnsf-p { transform: translateX(var(--x)); animation: dnsf-pass 4s linear infinite; }
  .st-on .dnsf-p.p1 { transform: translateX(62px); } .st-on .dnsf-p.p4 { transform: translateX(74px) translateY(-6px); opacity: .55; }
  .dnsf-p.p1 { animation-delay: -.66s; } .dnsf-p.p2 { animation-delay: -1.33s; } .dnsf-p.p3 { animation-delay: -2s; }
  .dnsf-p.p4 { animation-delay: -2.66s; } .dnsf-p.p5 { animation-delay: -3.33s; }
  .st-on .dnsf-p.bad { animation-name: dnsf-block; }
  .st-na .dnsf-p { display: none; }
  .dnsf-shield { fill: #dbeafe; stroke: #2f80ed; stroke-width: 1.6; } .night .dnsf-shield { fill: #1d3a5e; }
  .dnsf-mark { fill: none; stroke: #2f80ed; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
  .st-off .dnsf-shield { fill: #fdf0d5; stroke: #e09a1a; stroke-dasharray: 4 3; } .night.st-off .dnsf-shield { fill: #4a3a18; }
  .st-off .dnsf-mark { stroke: #e09a1a; }
  .st-na .dnsf-shield { fill: #e3e8ee; stroke: #9aa3ad; } .night.st-na .dnsf-shield { fill: #2a3140; stroke: #6b7482; }
  .st-na .dnsf-mark { stroke: #9aa3ad; } .night.st-na .dnsf-mark { stroke: #6b7482; }
  .dnsf-x circle { fill: #e5484d; } .dnsf-x path { stroke: #fff; stroke-width: 1.6; stroke-linecap: round; }
  .dnsf-x { animation: dnsf-blink 2s ease-in-out infinite; }
  .dnsf-count rect { fill: #e5484d; } .dnsf-count circle, .dnsf-count path { fill: none; stroke: #fff; stroke-width: 1; }
  .dnsf-count text { fill: #fff; font: 600 7.5px/1 Roboto, "Segoe UI", Helvetica, Arial, sans-serif; font-variant-numeric: tabular-nums; }
  /* The network strip: a 10 px cable edge to edge, its light pulses dashed along it; down when unavailable. */
  .g-net { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: #1e3a5f;
           background-image: repeating-linear-gradient(90deg, #4fc3f7 0 14px, transparent 14px 22px); background-size: 100% 2px;
           background-repeat: no-repeat; background-position: 0 50%; box-shadow: inset 0 2px 0 #2f5a8a; }
  .night .g-net { background-color: #0f1d33; box-shadow: inset 0 2px 0 #1e3a5f; }
  .st-na .g-net { background-color: #5a6370; background-image: repeating-linear-gradient(90deg, #e5484d 0 6px, transparent 6px 16px);
                  box-shadow: inset 0 2px 0 #77808c; }
  .night.st-na .g-net { background-color: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
  @keyframes dnsf-pass { from { transform: translateX(0); } to { transform: translateX(170px); } }
  @keyframes dnsf-block {
    0% { transform: translateX(0); opacity: 1; }
    40% { transform: translateX(76px); opacity: 1; }
    50% { transform: translateX(76px) translateY(-14px); opacity: 0; }
    100% { transform: translateX(76px) translateY(-14px); opacity: 0; }
  }
  @keyframes dnsf-blink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
  @media (prefers-reduced-motion: reduce) {
    .dnsf-p, .dnsf-x { animation: none !important; }
  }
  /* The icon (40 px, status colour, brand badge) and the titles, on the background at the left of the picture. */
  .htext { position: absolute; left: 12px; top: 6px; bottom: 16px; right: calc(var(--dnsf-scene-w, 200px) + 4px); display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .brand-link { align-self: center; }
  .htext .titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; container: dnsf-titles / inline-size; }
  .htext .titles > * { max-width: 100%; }
  .htext .name { font-size: 16px; font-weight: 600; }
  .htext .line { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; min-width: 0; }
  /* The status pill sits on the title line, right after the title, when the whole title and its whole label fit there;
     otherwise it goes on its own line under the subtitle (kept to one line), and when even that is too tight only its
     dot is left (the label stays in its tooltip and aria-label). Decided by measure (see _fitPill). */
  .htext .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .htext .trow .name { flex: 0 1 auto; min-width: 0; }
  .htext .trow .chip { flex: none; max-width: none; overflow: hidden; box-sizing: border-box; line-height: 16px; }
  .htext .titles.pill-below .trow { display: contents; }
  .htext .titles.pill-below .trow .name, .htext .titles.pill-below .trow .chip { max-width: 100%; }
  .htext .titles.pill-below .trow .chip { order: 3; }
  .htext .titles.pill-below .line { flex-wrap: nowrap; }
  .htext .titles.pill-below .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .htext .chip { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .night .htext .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .htext .sub { color: #3d5670; flex: 0 1 auto; min-width: 0; }
  .night .htext .sub { color: rgba(255,255,255,.8); }
  :host([hide-subtitle]) .htext .line .sub { display: none; }
  .banner .logo { align-self: center; background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(16,40,63,.1); }
  .banner.night .logo { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .logo .badge { box-shadow: 0 0 0 1px rgba(13,42,69,.16), 0 1px 3px rgba(13,42,69,.18); }
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; color: #33506b;
                  background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .banner ~ .content { padding-top: 12px; }
  /* Narrow card: no room for the picture beside the text, the background and the strip stay. */
  @container dnsf-card (max-width: 300px) { .dnsf-scene { display: none; } .htext { right: 36px; } }
`;
