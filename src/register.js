// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { DnsFilterCard } from "./full-card.js";
import { DnsFilterMiniCard } from "./mini-card.js";
import { DnsFilterCardEditor, DnsFilterMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("dns-filter-card", DnsFilterCard);
define("dns-filter-mini-card", DnsFilterMiniCard);
define("dns-filter-card-editor", DnsFilterCardEditor);
define("dns-filter-mini-card-editor", DnsFilterMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "dns-filter-card",
    name: "DNS Filter Card",
    description: "AdGuard Home, Pi-hole or Technitium DNS at a glance: queries, blocked, ratio, settings switches, pause, versions.",
  },
  {
    type: "dns-filter-mini-card",
    name: "DNS Filter Mini Card",
    description: "Compact AdGuard Home, Pi-hole or Technitium DNS overview: queries, blocked, blocked ratio and protection status.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-dns-filter-card" });
}

console.info(
  `%c DNS-FILTER-CARD %c v${VERSION} `,
  "color: white; background: #4f7fd9; font-weight: 700;",
  "color: #4f7fd9; background: white; font-weight: 700;"
);
