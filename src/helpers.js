// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: Home Assistant's full locale when its base matches the card's resolved language (keeps the
// region, e.g. pt-BR or de-CH), otherwise the resolved language. Home Assistant's "pt" is European Portuguese,
// which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
export const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

export const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

export const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

export const NO_VALUE = new Set(["unavailable", "unknown"]);

// Integer with the locale's thousands separator ("91 654" in French, "91,654" in English).
export const fmtInt = (v, loc) => (v === null ? "—" : new Intl.NumberFormat(loc || "en", { maximumFractionDigits: 0 }).format(v));
// Percentage with one decimal under 10 %, none above ("7.4%", "26%").
export const fmtPct = (v, loc) =>
  v === null ? "—" : `${new Intl.NumberFormat(loc || "en", { maximumFractionDigits: v < 10 ? 1 : 0 }).format(v)}%`;
// Duration in ms (AdGuard processing speed) with one decimal under 10.
export const fmtMs = (v, loc) =>
  v === null ? "—" : `${new Intl.NumberFormat(loc || "en", { maximumFractionDigits: v < 10 ? 1 : 0 }).format(v)} ms`;
// Large counters shortened on the mini card: 2 749 968 → "2.7M", 91 654 → "91.7k".
export const fmtShort = (v, loc) => {
  if (v === null) return "—";
  const f = (x, d) => new Intl.NumberFormat(loc || "en", { maximumFractionDigits: d }).format(x);
  if (v >= 1e6) return `${f(v / 1e6, v >= 1e7 ? 0 : 1)}M`;
  if (v >= 1e4) return `${f(v / 1e3, v >= 1e5 ? 0 : 1)}k`;
  return f(v, 0);
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// Only web addresses become links (a configuration_url can also be a homeassistant:// path).
export const webUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : null);

export const BRAND_NAMES = { adguard: "AdGuard Home", pihole: "Pi-hole", technitium: "Technitium DNS" };
export const BRAND_SITES = { adguard: "https://adguard.com/adguard-home/overview.html", pihole: "https://pi-hole.net", technitium: "https://technitium.com/dns/" };
// Brand badge on the header icon: the AdGuard shield in its green, the Pi-hole mark in its red.
export const BRAND_BADGES = {
  adguard: `<svg viewBox="0 0 24 24"><path fill="#68bc71" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/><path fill="#fff" d="M10.2,16.4L6.6,12.8L7.9,11.5L10.2,13.8L16.1,7.9L17.4,9.2L10.2,16.4Z"/></svg>`,
  pihole: `<svg viewBox="0 0 24 24"><path fill="#96060c" d="${ICONS.pihole}"/></svg>`,
  // Technitium DNS Server's mark (images/technitium.svg).
  technitium: `<svg viewBox="0 0 512 512"><path fill="#6698fe" d="M512 512H0V0h512zM118.1 85.8v211.7H182V85.7h211.6V22.3H22.3v63.5zm96 96.3h212.1v211.6h63.4V22.2h-63.8v96H214.2c-.1 21.3-.1 42.1-.1 63.9m-191.8-64v371.6H86v-95.8h211.6v-64.1H85.7V118.1zm95.8 371.5h371.5v-63.7h-95.8V214.2h-64.1v212H118.1z"/><path fill="#fefefe" d="M118.1 85.8H22.3V22.3h371.3v63.4H182v211.8h-63.9zm96 96.3v-63.9h211.6v-96h63.8v371.5h-63.4V182.1zm-191.8-64h63.3v211.7h211.9v64.1H85.9v95.8H22.2c.1-123.7.1-247.4.1-371.6m95.8 371.5v-63.4h211.6v-212h64.1v211.7h95.8v63.7z"/></svg>`,
};
// Header icon: the round DNS filter icon of the project page on the showcase site, in the status colour, with the
// brand mark as a badge.
export const headerIcon = (cls, brand) =>
  `<span class="logo ${cls}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${ICONS.shield}"/></svg>${
    brand ? `<span class="badge">${BRAND_BADGES[brand]}</span>` : ""
  }</span>`;
