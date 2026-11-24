// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { lang, t } from "./helpers.js";
import { discover, listDevices } from "./entity-discovery.js";
import { sameSig } from "./dom-patching.js";
import { STRINGS } from "./i18n/strings.js";

export class DnsFilterEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  // Home Assistant sets hass on every state change: the form only gets the new hass then, its schema and data are
  // rebuilt when what they show changes (language, registries).
  set hass(hass) {
    this._hass = hass;
    const key = [hass?.language, hass?.locale?.language, hass?.entities, hass?.devices];
    if (this._form && sameSig(key, this._hassKey)) {
      this._form.hass = hass;
      return;
    }
    this._hassKey = key;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "device", selector: { select: { mode: "dropdown", custom_value: true, options: this._hass ? listDevices(this._hass) : [] } } },
      { name: "title", selector: { text: {} } },
      { name: "url", selector: { text: { type: "url" } } },
      { type: "grid", name: "", schema: this.constructor.toggles.map((name) => ({ name, selector: { boolean: {} } })) },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: tr("lang_auto") },
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
              { value: "es", label: "Español" },
              { value: "sr", label: "Српски" },
              { value: "sr-Latn", label: "Srpski (latinica)" },
              { value: "it", label: "Italiano" },
              { value: "nl", label: "Nederlands" },
              { value: "pt", label: "Português (Portugal)" },
              { value: "pl", label: "Polski" },
              { value: "ro", label: "Română" },
              { value: "da", label: "Dansk" },
              { value: "sv", label: "Svenska" },
              { value: "bg", label: "Български" },
              { value: "ru", label: "Русский" },
              { value: "uk", label: "Українська" },
              { value: "hu", label: "Magyar" },
              { value: "sk", label: "Slovenčina" },
              { value: "cs", label: "Čeština" },
              { value: "sl", label: "Slovenščina" },
              { value: "lv", label: "Latviešu" },
              { value: "el", label: "Ελληνικά" },
            ],
          },
        },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => s.label ?? t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default (true).
          if (v === "" || v === undefined || v === null || (this.constructor.toggles.includes(k) && v === true) || (k === "illustration_theme" && v === "auto"))
            delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const name of this.constructor.toggles) if (data[name] === undefined) data[name] = true;
    if (!data.illustration_theme) data.illustration_theme = "auto";
    // Without device (hand-written YAML), show the instance the card shows: saving the form then keeps it.
    if (!data.device && this._hass) data.device = discover(this._hass, "").deviceId || undefined;
    // Schema before data: the device combo box resolves its label from the options, so they must be
    // there when the value lands (else it shows the raw device id).
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = data;
  }
}

export class DnsFilterCardEditor extends DnsFilterEditorBase {
  static get toggles() {
    return ["illustration", "show_title", "show_subtitle", "show_stats", "show_details", "show_switches", "show_history", "show_versions"];
  }
}

// The detailed view of the mini card is the full card: its editor offers the full card's options too.
export class DnsFilterMiniCardEditor extends DnsFilterEditorBase {
  static get toggles() {
    return [...DnsFilterCardEditor.toggles, "zoom"];
  }
}
