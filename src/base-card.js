// ---------------------------------------------------------------------------
// Base card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { BRAND_NAMES, BRAND_SITES, NO_VALUE, esc, fmtInt, fmtLang, fmtMs, fmtPct, fmtShort, headerIcon, num, svgIcon, t, webUrl } from "./helpers.js";
import { BANNER_STYLE, dnsfIsNight, dnsfSceneSvg, textWidth } from "./illustrated-header.js";
import { discover, protectionOf, versionsOf, withEntities } from "./entity-discovery.js";
import { fireMoreInfo, morph, sameSig } from "./dom-patching.js";
import { HIST_REFRESH, HIST_WINDOW, histPoints } from "./history.js";
import { BASE_STYLE, CONFIRM_GUARD_MS, DIALOG_STYLE, PAUSE_MINUTES, hms, isOutside, watchOutside } from "./styles.js";

export class DnsFilterBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.addEventListener("pointerdown", () => {
      // No update of the card between the press and the release: the patch keeps the nodes in place, but an element
      // appearing in front of the one pressed (a chip, a row) shifts its siblings, so that the element under the
      // pointer can change and the click land elsewhere or nowhere. The pending render is done once released (after
      // the click).
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    });
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      // After the click (same task): a press with no click (released elsewhere) draws what it held back.
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._html = "";
    this._dialog = null;
    this.shadowRoot.addEventListener("click", (ev) => {
      this._pressing = false;
      if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
        ev.stopImmediatePropagation();
        return;
      }
      const path = ev.composedPath();
      const action = path.find((n) => n.dataset?.action);
      if (this._dialog) {
        if (action?.dataset.action === "pause-for") {
          const minutes = Number(action.dataset.minutes);
          this._closeDialog(true);
          this._pause(minutes);
        } else if (action?.dataset.action === "dialog-cancel" || path[0] === action) {
          this._closeDialog(true);
        }
        return;
      }
      const a = action?.dataset.action;
      if (a === "toggle") return this._toggle(action.dataset.entity);
      if (a === "protection") return this._protectionClick();
      if (a === "pause") return this._openPause();
      if (a === "resume") return this._resume();
      if (a === "refresh") return this._refresh();
      const el = path.find((n) => n.dataset?.entity);
      if (!el) return;
      // A mouse or touch click (detail > 0) drops the focus first: the more-info dialog gives it back on close,
      // and the browser would then draw the keyboard focus ring around the pill or tile.
      if (ev.detail > 0) el.blur?.();
      fireMoreInfo(this, el.dataset.entity);
    });
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the popup; Tab and Shift+Tab stay on its buttons.
    this._onKey = (ev) => {
      if (!this._dialog) return;
      if (ev.key === "Tab") {
        const btns = [...this.shadowRoot.querySelectorAll(".modal button")];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
      } else if (ev.key === "Escape") {
        ev.stopPropagation();
        this._closeDialog(true);
      }
    };
    // A click elsewhere on the page closes the popup (and only that: the mini card stays zoomed).
    this._dialogOutside = watchOutside(
      (ev) => isOutside(this, ev),
      (ev) => {
        if (!this._dialog) return;
        this._dialogClosedBy = ev;
        this._closeDialog(false);
      },
    );
  }

  connectedCallback() {
    this._dialogOutside.on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._pillResize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._pillWidth) return;
        this._pillWidth = w;
        cancelAnimationFrame(this._pillFrame);
        this._pillFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._pillResize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._dialogOutside.off();
    this._pillResize?.disconnect();
    this._pillWidth = null;
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    window.removeEventListener("keydown", this._onKey);
    // Left (another dashboard view, a conditional card hidden): the popup does not come back open.
    this._dialog = null;
  }

  // Service calls: a failed call is logged (Home Assistant already shows a toast).
  _call(domain, service, data) {
    Promise.resolve()
      .then(() => this._hass?.callService(domain, service, data))
      .catch((err) => console.error(`dns-filter-card: ${domain}.${service} failed`, err));
  }

  _toggle(entityId) {
    const s = this._s(entityId);
    if (!s || s.state === "unavailable") return;
    this._call("switch", "toggle", { entity_id: entityId });
  }

  // Pi-hole: pause blocking for a while (pi_hole.disable with a duration), or until resumed (switch off). Technitium
  // DNS: its button for that duration.
  _pause(minutes) {
    const dev = this._dev();
    const sw = dev.e.protection;
    if (!sw) return;
    if (minutes > 0 && dev.brand === "technitium") {
      if (dev.pauses?.[minutes]) this._call("button", "press", { entity_id: dev.pauses[minutes] });
    } else if (minutes > 0) this._call("pi_hole", "disable", { entity_id: sw, duration: hms(minutes) });
    else this._call("switch", "turn_off", { entity_id: sw });
  }

  // The pause durations offered: Pi-hole's, or the buttons Technitium DNS has; until resumed last.
  _pauseMinutes() {
    const dev = this._dev();
    if (dev.brand !== "technitium") return PAUSE_MINUTES;
    return [...Object.keys(dev.pauses || {}).map(Number).sort((a, b) => a - b), 0];
  }

  _resume() {
    const sw = this._dev().e.protection;
    if (sw) this._call("switch", "turn_on", { entity_id: sw });
  }

  // A click on the status pill acts like the blocking controls: AdGuard Home toggles its protection switch,
  // Pi-hole opens the pause durations popup (blocking on) or resumes blocking (paused).
  _protectionClick() {
    const dev = this._dev();
    const s = this._s(dev.e.protection);
    if (!s || s.state === "unavailable") return;
    if (dev.brand === "adguard") return this._toggle(dev.e.protection);
    if (s.state === "on") this._openPause();
    else this._resume();
  }

  // AdGuard Home: refresh the filter lists (adguard.refresh).
  _refresh() {
    this._call("adguard", "refresh", { force: false });
  }

  _openPause() {
    const sw = this._dev().e.protection;
    if (!sw || this._s(sw)?.state === "unavailable") return;
    this._dialog = true;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector?.(".durations button")?.focus({ preventScroll: true });
  }

  _closeDialog(refocus) {
    if (!this._dialog) return;
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    if (refocus) this.shadowRoot.querySelector?.('[data-action="pause"]')?.focus({ preventScroll: true });
  }

  _dialogHtml() {
    if (!this._dialog) return "";
    const loc = this._loc();
    const label = (m) =>
      m === 0
        ? this._t("indefinitely")
        : m >= 60
          ? this._t("hours_n").replace("{n}", fmtInt(m / 60, loc))
          : this._t("minutes_n").replace("{n}", fmtInt(m, loc));
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="dialog-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-body">
        <h3 id="dlg-title">${svgIcon(ICONS.pause)}${esc(this._t("pause"))}</h3>
        <div class="hint" id="dlg-body">${esc(this._t("pause_hint"))}</div>
        <div class="durations">${this._pauseMinutes().map(
          (m) => `<button type="button" class="act" data-action="pause-for" data-minutes="${m}">${esc(label(m))}</button>`
        ).join("")}</div>
        <div class="modal-actions"><button type="button" class="act" data-action="dialog-cancel">${esc(this._t("cancel"))}</button></div>
      </div>
    </div>`;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const sig = this._signature();
    if (sameSig(sig, this._sig)) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._update();
  }

  _dev() {
    return withEntities(discover(this._hass, this._config.device), this._config.entities);
  }

  _t(key) {
    return t(this._hass, this._config, key);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  _n(key) {
    return num(this._s(this._dev().e[key]));
  }

  // What the render depends on: language, dark mode, the registries and the states of the instance's entities.
  _signature() {
    const h = this._hass;
    const sig = [h.language, h.locale?.language, h.themes?.darkMode, h.entities, h.devices];
    const dev = this._dev();
    sig.push(dev);
    if (dev.deviceId) for (const id of Object.values(dev.e)) sig.push(h.states[id]);
    return sig;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    // Not under a press (see the pointerdown listener): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this._sig = sig ?? this._signature();
    const html = this._render();
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
    this._fitPill();
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (.pill-below) and the title keeps its row
  // (cut only when it does not fit alone). The subtitle then keeps one line (its whole text in its tooltip), and when
  // the block still runs out of the banner or into its ground strip, or the label does not fit its own line, the pill
  // keeps its dot alone (.pill-dot, the label in its tooltip and aria-label). Measured after each render and on each
  // new width, never by a fixed width, so that every language fits.
  _fitPill() {
    // Home Assistant's <ha-card> (a Lit element) shows its content only from its first update, a microtask after it
    // is connected: measured before, everything is 0 px wide and the pill lands on the wrong line. Fitted then.
    const haCard = this.shadowRoot?.querySelector?.("ha-card");
    if (haCard && haCard.hasUpdated === false) {
      this._pillWait ??= (haCard.updateComplete?.then ? haCard.updateComplete : new Promise((r) => requestAnimationFrame(r))).then(() => {
        this._pillWait = null;
        this._fitPill();
      });
      return;
    }
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const chips = [...t.querySelectorAll(".chip")];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove("pill-below", "pill-dot");
      const sub = t.querySelector(".sub");
      sub?.removeAttribute("title");
      if (!chips[0].querySelector(".txt")?.getClientRects().length) continue;
      const avail = t.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(chips[0].parentElement).columnGap) || 0;
      const widths = chips.map((c) => {
        const cs = getComputedStyle(c);
        return c.getBoundingClientRect().width + (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0);
      });
      if (textWidth(t.querySelector(".name")) + widths.reduce((w, c) => w + gap + c, 0) <= avail + 0.01) continue;
      t.classList.add("pill-below");
      if (sub && sub.scrollWidth > sub.clientWidth) sub.title = sub.textContent.trim();
      const banner = t.closest(".banner");
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".g-net")?.getBoundingClientRect().top ?? box?.bottom;
      const r = t.getBoundingClientRect();
      const out = box && (r.top < box.top - 0.5 || r.bottom > floor + 0.5);
      const room = avail;
      if (out || widths.some((w) => w > room + 0.01)) t.classList.add("pill-dot");
    }
  }

  // Status pill text and class from the protection state.
  _status(dev) {
    const p = protectionOf(this._hass, dev);
    if (!p) return null;
    if (NO_VALUE.has(p.state)) return { ...p, cls: "na", text: this._t(p.state) };
    if (p.state === "on") return { ...p, cls: "ok", text: this._t("status_on") };
    return { ...p, cls: "warn", text: this._t(dev.brand === "adguard" ? "status_off" : "status_paused") };
  }

  // Tooltip of the status pill: what a click does (the state itself is the pill's text).
  _statusAction(dev, status) {
    if (NO_VALUE.has(status.state)) return status.text;
    if (dev.brand === "adguard") return `${status.text} · ${this._t(status.state === "on" ? "protection_off" : "protection_on")}`;
    return `${status.text} · ${this._t(status.state === "on" ? "pause" : "resume")}`;
  }

  _header(dev) {
    const c = this._config;
    const status = this._status(dev);
    const name = c.title || dev.info?.name || BRAND_NAMES[dev.brand];
    const versions = versionsOf(this._hass, dev);
    const sub = [BRAND_NAMES[dev.brand], !this._compactHeader() && versions[0] ? versions[0].version : null].filter(Boolean).join(" · ");
    const href = webUrl(c.url) || webUrl(dev.info?.url) || BRAND_SITES[dev.brand];
    const title = webUrl(c.url) || webUrl(dev.info?.url) ? this._t("open_ui") : this._t("open_brand").replace("{brand}", BRAND_NAMES[dev.brand]);
    const link = `<a class="brand-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(title)}">${headerIcon(status?.cls ?? "na", dev.brand)}</a>`;
    const chip = status
      ? `<span class="chip clickable ${status.cls}" role="button" tabindex="0" data-action="protection" title="${esc(this._statusAction(dev, status))}" aria-label="${esc(
          status.text
        )}"><span class="dot"></span><span class="txt">${esc(status.text)}</span></span>`
      : "";
    if (c.illustration !== false) {
      // The illustrated banner: the requests through the shield, the protection state and the blocked count.
      const st = !status || NO_VALUE.has(status.state) ? "na" : status.state === "on" ? "on" : "off";
      const blocked = this._n("blocked");
      const short = blocked === null ? "" : fmtShort(blocked, this._loc());
      // The blocked count, and on the full card the single AdGuard Home version (Pi-hole's are in the footer).
      const count = [
        blocked === null ? null : this._t("blocked_n").replace("{n}", this._compactHeader() ? short : fmtInt(blocked, this._loc())),
        dev.brand === "adguard" && !this._compactHeader() && versions[0] ? versions[0].version : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const cls = `banner st-${st}${dnsfIsNight(this._hass, c) ? " night" : ""}`;
      return `
      <div class="${cls}">${dnsfSceneSvg(st, short)}
        <div class="htext">${link}<div class="titles"><div class="trow"><div class="name">${esc(name)}</div>${chip}</div>${
          count ? `<div class="line"><span class="sub">${esc(count)}</span></div>` : ""
        }</div></div>
        ${this._zoomButton()}
      </div>${this._dialogHtml()}`;
    }
    return `
      <div class="header">
        ${link}
        <div class="titles">
          <div class="name">${esc(name)}</div>
          <div class="sub">${esc(sub)}</div>
          ${chip}
        </div>
        ${this._zoomButton()}
      </div>${this._dialogHtml()}`;
  }

  _compactHeader() {
    return false;
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  _zoomButton() {
    return "";
  }

  _noDevice() {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(
      this._config.device ? `${this._t("unknown_device")}: ${this._config.device}` : this._t("no_device")
    )}</div></ha-card>`;
  }

  // 24 h of 5-minute means from the recorder's statistics, fetched again every 5 minutes. Returns what is already
  // there (nothing at first): the card renders again when the answer comes.
  _history(ids) {
    if (this._config.show_history === false || !ids.length) return null;
    const key = ids.join(",");
    if (this._hass.callWS && (this._histKey !== key || Date.now() - this._histAt > HIST_REFRESH)) {
      this._histKey = key;
      this._histAt = Date.now();
      this._hass
        .callWS({
          type: "recorder/statistics_during_period",
          start_time: new Date(Date.now() - HIST_WINDOW).toISOString(),
          statistic_ids: ids,
          period: "5minute",
          types: ["mean"],
        })
        .then((r) => {
          if (this._histKey !== key) return;
          this._hist = Object.fromEntries(ids.map((id) => [id, histPoints(r?.[id])]));
          this._update();
        })
        .catch(() => {
          this._histAt = Date.now() - HIST_REFRESH + 60000;
        });
    }
    return this._histKey === key ? this._hist : null;
  }

  // The four statistics of an instance, in tile order: queries, blocked, blocked ratio, then the processing time
  // (AdGuard Home) or the domains on the block lists (Pi-hole).
  _stats(dev) {
    const loc = this._loc();
    const e = dev.e;
    const v = (k) => num(this._s(e[k]));
    const stats = [
      { key: "queries", id: e.queries, icon: ICONS.earth, cls: "s-queries", label: this._t("queries"), value: v("queries"), text: fmtInt(v("queries"), loc), short: fmtShort(v("queries"), loc) },
      { key: "blocked", id: e.blocked, icon: ICONS.hand, cls: "s-blocked", label: this._t("blocked"), value: v("blocked"), text: fmtInt(v("blocked"), loc), short: fmtShort(v("blocked"), loc) },
      { key: "ratio", id: e.ratio, icon: ICONS.pie, cls: "s-ratio", label: this._t("blocked_ratio"), value: v("ratio"), text: fmtPct(v("ratio"), loc), short: fmtPct(v("ratio"), loc) },
    ];
    // No ratio sensor (Technitium DNS): worked out from the blocked and total queries, opening the blocked ones.
    if (!e.ratio && e.blocked && e.queries) {
      const q = v("queries");
      const r = q > 0 && v("blocked") !== null ? (v("blocked") * 100) / q : null;
      Object.assign(stats[2], { id: e.blocked, value: r, text: fmtPct(r, loc), short: fmtPct(r, loc) });
    }
    if (dev.brand === "adguard")
      stats.push({ key: "speed", id: e.speed, icon: ICONS.speed, cls: "s-fourth", label: this._t("avg_speed"), value: v("speed"), text: fmtMs(v("speed"), loc), short: fmtMs(v("speed"), loc) });
    else
      stats.push({ key: "domains", id: e.domains, icon: ICONS.list, cls: "s-fourth", label: this._t("domains_on_lists"), value: v("domains"), text: fmtInt(v("domains"), loc), short: fmtShort(v("domains"), loc) });
    return stats.filter((s) => s.id);
  }

  // The detail counters under the tiles: AdGuard Home's parental / safe browsing / safe search counts and rules,
  // Pi-hole's clients, unique domains, cached and forwarded queries.
  _details(dev) {
    const loc = this._loc();
    const e = dev.e;
    const items =
      dev.brand === "adguard"
        ? [
            ["parental_blocked", ICONS.child, "parental_blocked"],
            ["safe_browsing_blocked", ICONS.shield_search, "safe_browsing_blocked"],
            ["safe_searches", ICONS.magnify, "safe_searches"],
            ["rules", ICONS.list, "rules"],
          ]
        : [
            ["clients", ICONS.clients, "clients"],
            ["unique_domains", ICONS.web, "unique_domains"],
            ["cached", ICONS.database, "cached"],
            ["forwarded", ICONS.forward, "forwarded"],
            ["seen_clients", ICONS.clients, "seen_clients"],
          ];
    return items
      .filter(([k]) => e[k])
      .map(([k, icon, label]) => ({ id: e[k], icon, text: `${fmtInt(num(this._s(e[k])), loc)} ${this._t(label)}` }));
  }

  // Update chips: one per update entity that is on (Pi-hole: Core, FTL, Web; AdGuard Home: one).
  _updates(dev) {
    return versionsOf(this._hass, dev)
      .filter((v) => v.update !== null)
      .map((v) => ({ id: v.id, text: `${this._t("update_available")} · ${v.label} ${v.update}`.trim(), short: `${v.label} ${v.update}`.trim() }));
  }
}
