# Changelog

## 1.0.0 - 2026-11-08

### Features
- First release: **DNS Filter Card** (`custom:dns-filter-card`) and **DNS Filter Mini Card** (`custom:dns-filter-mini-card`) for the AdGuard Home and Pi-hole integrations of Home Assistant.
- Entities discovered through the entity and device registries (`translation_key`), whatever the Home Assistant language; several instances supported, both integrations can be mixed.
- Statistics tiles (DNS queries, blocked, blocked ratio, processing time or domains on lists) with their last 24 hours drawn behind (recorder statistics), detail counters, status pill.
- AdGuard Home: setting switches as chips (protection, filtering, parental control, safe browsing, safe search, query log), filter lists refresh button, update chip.
- Pi-hole: pause button with a durations popup at the top of the card (5 min to 2 h, or until resumed), resume button, Core / FTL / Web versions and update chips.
- Mini card with its detail button, visual editor for both cards, light and dark mode, 22 languages.
