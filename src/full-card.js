// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { esc, svgIcon } from "./helpers.js";
import { discover, versionsOf } from "./entity-discovery.js";
import { spark } from "./history.js";
import { BASE_STYLE } from "./styles.js";
import { DnsFilterBase } from "./base-card.js";

export const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  /* Statistics tiles, in the spirit of the Pi-hole dashboard: one tint per statistic, the icon as a watermark, the
     24 h curve behind. */
  .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .stat { position: relative; overflow: hidden; isolation: isolate; border-radius: 12px; padding: 10px 12px; min-height: 58px; box-sizing: border-box;
          display: flex; flex-direction: column; justify-content: center; gap: 2px;
          background: color-mix(in srgb, var(--c) 14%, transparent); }
  .stat .spark { position: absolute; left: 0; bottom: 0; width: 100%; height: 60%; z-index: -1; pointer-events: none; }
  .stat .wm { position: absolute; right: -6px; bottom: -8px; width: 52px; height: 52px; fill: var(--c); opacity: .16; z-index: -1; }
  .stat .k { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat .v { font-size: 20px; font-weight: 600; line-height: 1.15; font-variant-numeric: tabular-nums;
             color: color-mix(in srgb, var(--c) 55%, var(--primary-text-color, #212121)); }
  .s-queries { --c: var(--dnsf-info); } .s-blocked { --c: var(--dnsf-crit); } .s-ratio { --c: var(--dnsf-warn); } .s-fourth { --c: var(--dnsf-ok); }
  .facts { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; }
  .facts > span { display: inline-flex; align-items: center; gap: 5px; }
  .facts .icon { width: 14px; height: 14px; color: var(--secondary-text-color); }
  /* Switch chips: glass, the icon in the accent color when on, never filled. */
  .switches { display: flex; flex-wrap: wrap; gap: 6px; }
  .sw { all: unset; display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 10px; font-size: 13px; cursor: pointer;
        background: var(--secondary-background-color, rgba(127,127,127,.08)); color: var(--secondary-text-color); box-sizing: border-box; }
  .sw .icon { width: 16px; height: 16px; }
  .sw.on { color: var(--primary-text-color); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dnsf-accent) 45%, transparent); }
  .sw.on .icon { color: var(--dnsf-accent); }
  .sw:hover { background: color-mix(in srgb, var(--dnsf-accent) 14%, var(--secondary-background-color, transparent)); }
  .sw:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .sw:disabled { cursor: default; opacity: .4; }
  .sw.warn-off:not(.on) .icon { color: var(--dnsf-warn); }
  .foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 10px; font-size: 11px; color: var(--secondary-text-color); }
  .foot .versions { display: flex; flex-wrap: wrap; gap: 2px 10px; }
  .foot .versions span b { font-weight: 500; color: var(--primary-text-color); }
  .foot > .chip { flex: 0 1 auto; min-width: 0; }
  .foot .actions { display: flex; gap: 4px; margin-left: auto; }
  @container dnsf-card (max-width: 240px) { .stats { grid-template-columns: minmax(0, 1fr); } }
`;

export class DnsFilterCard extends DnsFilterBase {
  static getConfigElement() {
    return document.createElement("dns-filter-card-editor");
  }

  static getStubConfig(hass) {
    const device = hass ? discover(hass, "").deviceId : null;
    return device ? { device } : {};
  }

  getCardSize() {
    return 6;
  }

  // 9 columns: 234 px on a phone (narrower, the two tile columns no longer fit).
  getGridOptions() {
    return { columns: 12, min_columns: 9 };
  }

  _render() {
    const dev = this._dev();
    if (!dev.deviceId) return this._noDevice();
    const c = this._config;
    const parts = [];
    if (c.show_stats !== false) parts.push(this._statsHtml(dev));
    if (c.show_details !== false) parts.push(this._detailsHtml(dev));
    if (c.show_switches !== false) parts.push(this._switchesHtml(dev));
    parts.push(this._footHtml(dev));
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._header(dev)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _statsHtml(dev) {
    const stats = this._stats(dev);
    if (!stats.length) return "";
    const hist = this._history(stats.map((s) => s.id));
    return `<div class="stats">${stats
      .map(
        (s) => `<div class="stat clickable ${s.cls}" role="button" tabindex="0" data-key="${s.key}" data-entity="${s.id}" title="${esc(s.label)}">
          ${spark(hist?.[s.id])}<svg class="wm" viewBox="0 0 24 24" aria-hidden="true"><path d="${s.icon}"/></svg>
          <div class="k">${esc(s.label)}</div><div class="v">${s.text}</div>
        </div>`
      )
      .join("")}</div>`;
  }

  _detailsHtml(dev) {
    const items = this._details(dev);
    if (!items.length) return "";
    return `<div class="facts">${items
      .map((i) => `<span class="clickable" role="button" tabindex="0" data-key="${i.id}" data-entity="${i.id}">${svgIcon(i.icon)}${esc(i.text)}</span>`)
      .join("")}</div>`;
  }

  // AdGuard Home: one chip per setting switch (protection, filtering, parental control, safe browsing, safe search,
  // query log). Pi-hole: the blocking chip, plus a pause button (durations popup) or a resume button.
  _switchesHtml(dev) {
    const e = dev.e;
    const chips = [];
    const chip = (id, icon, label, extra = "") => {
      const s = this._s(id);
      if (!s) return;
      const on = s.state === "on";
      const disabled = s.state === "unavailable" ? " disabled" : "";
      const text = esc(this._t(label));
      chips.push(
        `<button type="button" class="sw ${on ? "on" : ""} ${extra}" data-key="${id}" data-action="toggle" data-entity="${id}" aria-pressed="${on}" title="${text}"${disabled}>${svgIcon(
          icon
        )}<span>${text}</span></button>`
      );
    };
    if (dev.brand === "adguard") {
      chip(e.protection, ICONS.shield, "protection", "warn-off");
      chip(e.filtering, ICONS.filter, "filtering");
      chip(e.parental, ICONS.child, "parental");
      chip(e.safe_browsing, ICONS.shield_search, "safe_browsing");
      chip(e.safe_search, ICONS.magnify, "safe_search");
      chip(e.query_log, ICONS.log, "query_log");
    } else {
      const s = this._s(e.protection);
      if (s) {
        const on = s.state === "on";
        const disabled = s.state === "unavailable" ? " disabled" : "";
        const label = esc(this._t(on ? "pause" : "resume"));
        chips.push(
          `<button type="button" class="sw ${on ? "on" : "warn-off"}" data-key="pause" data-action="${on ? "pause" : "resume"}" title="${label}"${disabled}>${svgIcon(
            on ? ICONS.pause : ICONS.play
          )}<span>${label}</span></button>`
        );
      }
    }
    if (!chips.length) return "";
    return `<div><div class="section-title">${svgIcon(ICONS.shield)}${esc(this._t(dev.brand === "adguard" ? "switches" : "blocking"))}</div><div class="switches">${chips.join(
      ""
    )}</div></div>`;
  }

  // Versions, update chips and, for AdGuard Home, the filter lists refresh button.
  _footHtml(dev) {
    const parts = [];
    if (this._config.show_versions !== false) {
      const versions = versionsOf(this._hass, dev);
      // One version only (AdGuard Home) already sits in the subtitle: the footer lists them when there are several.
      if (versions.length > 1)
        parts.push(
          `<div class="versions">${versions
            .map((v) => `<span data-key="${esc(v.label)}"${v.id ? ` class="clickable" role="button" tabindex="0" data-entity="${v.id}"` : ""}>${esc(v.label)} <b>${esc(v.version)}</b></span>`)
            .join("")}</div>`
        );
    }
    for (const u of this._updates(dev))
      parts.push(`<span class="chip upd clickable" role="button" tabindex="0" data-key="upd-${u.id}" data-entity="${u.id}">${svgIcon(ICONS.update)}<span class="txt">${esc(u.text)}</span></span>`);
    if (dev.brand === "adguard") {
      const label = esc(this._t("refresh"));
      parts.push(`<div class="actions"><button type="button" class="action" data-action="refresh" title="${label}" aria-label="${label}">${svgIcon(ICONS.refresh)}</button></div>`);
    }
    return parts.length ? `<div class="foot">${parts.join("")}</div>` : "";
  }
}
