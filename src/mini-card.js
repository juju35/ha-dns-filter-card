// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { esc, svgIcon } from "./helpers.js";
import { spark } from "./history.js";
import { BASE_STYLE, isOutside, watchOutside } from "./styles.js";
import { DnsFilterCard } from "./full-card.js";

export const MINI_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .mini-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .ms { position: relative; overflow: hidden; isolation: isolate; border-radius: 10px; padding: 6px 8px; min-width: 0;
        background: color-mix(in srgb, var(--c) 14%, transparent); display: flex; flex-direction: column; gap: 1px; }
  .ms .spark { position: absolute; left: 0; bottom: 0; width: 100%; height: 55%; z-index: -1; pointer-events: none; }
  .ms .k { font-size: 11px; color: var(--secondary-text-color); display: flex; align-items: center; gap: 4px; min-width: 0; }
  .ms .k .icon { width: 12px; height: 12px; color: var(--c); }
  .ms .k span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ms .v { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap;
           color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color, #212121)); }
  .s-queries { --c: var(--dnsf-info); } .s-blocked { --c: var(--dnsf-crit); } .s-ratio { --c: var(--dnsf-warn); }
  .bar { height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--dnsf-crit); transition: width .6s ease; }
  @media (prefers-reduced-motion: reduce) { .bar > div { transition: none; } }
  .foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .foot span { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .foot .txt { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .foot .icon { width: 14px; height: 14px; }
  .foot > .upd { flex: 0 1 auto; min-width: 0; overflow: hidden; color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color, #212121)); font-weight: 500; }
  /* The banner's picture, narrower: the pipe starts further right, the shield and the counter stay. */
  .banner { --dnsf-scene-w: 150px; }
  /* Narrow mini card (6 columns on a phone): one statistic per line. */
  @container dnsf-card (max-width: 240px) { .mini-stats { grid-template-columns: minmax(0, 1fr); } .ms { flex-direction: row; align-items: center; justify-content: space-between; } }
`;

// The mini card extends the full card: its zoom button (top right, `zoom: false` removes it) switches it to the full
// card's content, same configuration, and back; a click anywhere outside the card brings it back too.
export class DnsFilterMiniCard extends DnsFilterCard {
  static getConfigElement() {
    return document.createElement("dns-filter-mini-card-editor");
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev));
    this._unzoom = watchOutside(
      (ev) => isOutside(this, ev),
      (ev) => {
        if (this._dialogClosedBy === ev) return;
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    if (!zoomed && this._dialog) {
      this._dialog = null;
      window.removeEventListener("keydown", this._onKey);
    }
    this._update(this._sig);
  }

  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _compactHeader() {
    return !this._zoomed;
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button type="button" class="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const dev = this._dev();
    if (!dev.deviceId) return this._noDevice();
    const stats = this._stats(dev).slice(0, 3);
    const hist = this._history(stats.filter((s) => s.key !== "ratio").map((s) => s.id));
    const ratio = stats.find((s) => s.key === "ratio");
    const tiles = stats
      .map(
        (s) => `<div class="ms clickable ${s.cls}" role="button" tabindex="0" data-key="${s.key}" data-entity="${s.id}" title="${esc(s.label)}">${spark(hist?.[s.id])}
          <div class="k">${svgIcon(s.icon)}<span>${esc(s.label)}</span></div><div class="v">${s.short}</div></div>`
      )
      .join("");
    // The status is the header's pill (a blocking control too); the footer keeps the updates.
    const foot = [];
    for (const u of this._updates(dev))
      foot.push(
        `<span class="clickable upd" role="button" tabindex="0" data-key="upd-${u.id}" data-entity="${u.id}" title="${esc(u.text)}" aria-label="${esc(u.text)}">${svgIcon(
          ICONS.update
        )}<span class="txt">${esc(u.short)}</span></span>`
      );
    const pct = ratio?.value;
    return `<style>${BASE_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._header(dev)}
        <div class="content">
          ${tiles ? `<div class="mini-stats">${tiles}</div>` : ""}
          ${pct !== null && pct !== undefined ? `<div class="bar" title="${esc(ratio.label)}"><div style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>` : ""}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
