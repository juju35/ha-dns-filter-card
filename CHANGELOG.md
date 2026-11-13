# Changelog

## 1.3.2 - 2026-11-14

### Fixes
- Mini card visual editor: **Show title** and **Show subtitle** are now offered, as well as the full card options shown in its detailed view (`show_stats`, `show_details`, `show_switches`, `show_versions`).
- README: `entities` is marked YAML only (the visual editor keeps it).

## 1.3.1 - 2026-11-13

### Fixes
- Closing on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so the Pi-hole pause popup and the detailed view of the mini card stayed open. The press and the release are caught instead; a press in the card released outside of it and a scroll do not close anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state: popup closed, mini card compact.
- **Clicks lost under an update**: Home Assistant updates the card several times a second. The card is patched in place, but an element appearing in front of the one pressed (a chip, a row) shifted its siblings between the press and the release, so that the click could land on another element or nowhere (a switch, the pause button or a duration that did not react). The card is no longer updated while a press is in progress; the pending update is drawn right after the click, or after the release when no click follows.

## 1.3.0 - 2026-11-12

### Features
- `show_title` and `show_subtitle` options (also in the visual editor) hide the header's title and its subtitle, separately, for a card placed under a section heading of its own (asked in juju35/ha-vehicle-card#72).

## 1.2.0 - 2026-11-11

### Features
- **Technitium DNS** ([#11](https://github.com/juju35/ha-dns-filter-card/issues/11)): the [technitiumdns](https://github.com/Atlas-Commons/home-assistant-technitiumdns) integration of the Marketplace is found like AdGuard Home and Pi-hole: total and blocked queries, the blocked ratio worked out from both, blocked zones, clients, cached and recursive queries, the ad blocking switch, and the pause through its "Disable Ad Blocking for …" buttons (the durations it offers, or until resumed).
- **Sensors of your choice**: `entities` replaces the sensors found for a tile or a counter (`queries`, `blocked`, `ratio`, `domains`, `clients`…) and the blocking switch (`protection`).

## 1.1.1 - 2026-11-09

### Fixes
- Translations: the cards are defined once the page's language file has arrived (at most 1.5 s; Home Assistant builds a card when its element gets defined), so the first render is already translated instead of English then redrawn; until a language file is in, a missing text reads the English one wherever the card has no fallback of its own.

## 1.1.0 - 2026-11-09

### Performance
- **Translations load on demand**: the bundle keeps English only (114 KB → 70 KB) and each other language is its own `dns-filter-card.i18n.<lang>.js` file next to it, fetched the first time a card needs it. Home Assistant loads every dashboard resource on every dashboard, so each page used to download and parse all 22 languages to use one. Until a language file has arrived (a few milliseconds), texts fall back to English, and the cards redraw once it is there.

### Maintenance
- Build: `scripts/i18n-split.mjs` splits the built bundle and rebuilds every table from the split files to check them (the build fails on any difference); `src/` keeps every language as before.
- Release: every file of `dist/` is attached. Manual installation copies the translation files too.

## 1.0.3 - 2026-11-08

### Changes
- The status pill no longer opens a more-info dialog: a click turns the AdGuard Home protection on or off, or pauses / resumes Pi-hole blocking (the tooltip says what the click does).

## 1.0.2 - 2026-11-08

### Fixes
- No focus ring left around the status pill or a tile after a mouse click opened its more-info dialog (keyboard use keeps it).

## 1.0.1 - 2026-11-08

### Fixes
- Visual editor: the instance selector shows the instance name (« AdGuard Home · AdGuard Home ») instead of its device id.

## 1.0.0 - 2026-11-08

### Features
- First release: **DNS Filter Card** (`custom:dns-filter-card`) and **DNS Filter Mini Card** (`custom:dns-filter-mini-card`) for the AdGuard Home and Pi-hole integrations of Home Assistant.
- Entities discovered through the entity and device registries (`translation_key`), whatever the Home Assistant language; several instances supported, both integrations can be mixed.
- Statistics tiles (DNS queries, blocked, blocked ratio, processing time or domains on lists) with their last 24 hours drawn behind (recorder statistics), detail counters, status pill.
- AdGuard Home: setting switches as chips (protection, filtering, parental control, safe browsing, safe search, query log), filter lists refresh button, update chip.
- Pi-hole: pause button with a durations popup at the top of the card (5 min to 2 h, or until resumed), resume button, Core / FTL / Web versions and update chips.
- Mini card with its detail button, visual editor for both cards, light and dark mode, 22 languages.
