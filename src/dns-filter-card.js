/*
 * DNS Filter Card for Home Assistant (AdGuard Home, Pi-hole, Technitium DNS)
 * https://github.com/juju35/ha-dns-filter-card
 *
 * Lovelace cards for the AdGuard Home and Pi-hole integrations included in Home Assistant: the
 * entities of each instance are found through the entity and device registries, typed by their
 * language-independent translation_key, so the cards work whatever the Home Assistant language.
 */

const VERSION = "__VERSION__";

const ICONS = {
  shield: "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z",
  shield_off: "M1,4.27L2.28,3L20.5,21.22L19.23,22.5L17,20.25C15.57,21.5 13.88,22.42 12,23C6.84,21.74 3,16.55 3,11V5.27L1,4.27M12,1L21,5V11C21,13.59 20.17,16.08 18.76,18.12L4.96,4.32L12,1Z",
  earth: "M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  hand: "M21,7C21,5.9 20.1,5 19,5C18.8,5 18.6,5 18.4,5.1C18.1,4.2 17.3,3.5 16.3,3.5C16.1,3.5 15.9,3.5 15.7,3.6C15.4,2.7 14.5,2 13.5,2C13.3,2 13.1,2 12.9,2.1C12.6,1.2 11.8,0.5 10.8,0.5C9.7,0.5 8.8,1.4 8.8,2.5V10.6L7.3,9.1C6.5,8.3 5.2,8.3 4.4,9.1C3.6,9.9 3.6,11.2 4.4,12L9.3,16.9C10.5,18.1 12.1,18.8 13.8,18.8H15.5C18.5,18.8 21,16.3 21,13.3V7Z",
  pie: "M11,2V22C5.9,21.5 2,17.2 2,12C2,6.8 5.9,2.5 11,2M13,2V11H22C21.5,6.2 17.8,2.5 13,2M13,13V22C17.7,21.5 21.5,17.8 22,13H13Z",
  speed: "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z",
  list: "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",
  clients: "M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z",
  web: "M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  database: "M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z",
  forward: "M11.5,20L16.36,10.27H13V3L8,12.73H11.5V20Z",
  timer: "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  refresh: "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",
  update: "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,7L7,12H10V16H14V12H17L12,7Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  // Switches: filtering, parental control, safe browsing, safe search, query log.
  filter: "M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z",
  child: "M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M15.9 8.1C15.5 7.7 14.8 7 13.5 7H11C8.2 7 6 4.8 6 2H4C4 5.2 6.1 7.8 9 8.7V22H11V17H13V22H15V12.1L19 16L20.4 14.6L15.9 8.1Z",
  shield_search: "M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C12.24 21.94 12.5 21.86 12.73 21.78C12.27 21.09 12 20.27 12 19.39C12 17.33 13.33 15.65 15.16 15.08C15.06 14.53 15 13.95 15 13.4C15 10.17 17.62 7.54 20.86 7.54L20 5L12 2M12 15.1C10.5 15.1 9.3 13.9 9.3 12.4S10.5 9.7 12 9.7 14.7 10.9 14.7 12.4 13.5 15.1 12 15.1M20.31 17.9C20.31 16.57 19.24 15.5 17.91 15.5S15.5 16.57 15.5 17.9 16.58 20.3 17.91 20.3 20.31 19.23 20.31 17.9M22.3 23L19.75 20.45C19.21 20.78 18.6 21 17.91 21 16.16 21 14.75 19.59 14.75 17.84S16.16 14.68 17.91 14.68 21.07 16.09 21.07 17.84C21.07 18.53 20.85 19.14 20.52 19.68L23 22.3L22.3 23Z",
  magnify: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
  log: "M15.5,12C18,12 20,14 20,16.5C20,17.38 19.75,18.21 19.31,18.9L22.39,22L21,23.39L17.88,20.32C17.19,20.75 16.37,21 15.5,21C13,21 11,19 11,16.5C11,14 13,12 15.5,12M15.5,14A2.5,2.5 0 0,0 13,16.5A2.5,2.5 0 0,0 15.5,19A2.5,2.5 0 0,0 18,16.5A2.5,2.5 0 0,0 15.5,14M5,3H19C20.11,3 21,3.89 21,5V13.03C20.5,12.23 19.81,11.54 19,11V5H5V19H9.5C9.81,19.75 10.26,20.42 10.81,21H5C3.89,21 3,20.11 3,19V5C3,3.89 3.89,3 5,3M7,7H17V9H7V7M7,11H12.03C11.23,11.5 10.54,12.19 10,13H7V11M7,15H9.17C9.06,15.5 9,16 9,16.5V17H7V15Z",
  // mdi:pi-hole, the Pi-hole badge.
  pihole: "M5.62,2C9.5,2 11.57,4.29 11.77,7.93C12.5,3.57 15.93,4.08 15.93,4.08C16.1,6.55 14.07,8.05 11.77,8.17C11.12,6.81 7.25,3.47 7.25,3.47C7.23,3.5 10.97,6.74 10.83,8.15C8.33,7.88 5.82,6 5.62,2M6.06,13.11L9.92,9.25C11.09,8.08 13,8.08 14.16,9.25L18,13.11C19.19,14.28 19.19,16.18 18,17.35L14.16,21.21C13,22.38 11.09,22.38 9.92,21.21L6.06,17.35C4.89,16.18 4.89,14.28 6.06,13.11M9.39,19.59C9.39,18.36 10.15,16.85 12.09,16.85C13.4,16.85 14.87,18.1 16.31,17.96C14.87,17.92 13.59,16.85 13.59,15.19C13.59,13.86 14.69,12.9 14.69,11.34C14.63,12.33 13.82,13.77 12,13.77C10.59,13.77 9.55,12.63 7.87,12.63C8.58,12.89 9.39,13.66 9.39,15.09C9.39,16.2 8.33,17.7 8.33,17.7C8.33,17.7 9.39,16.85 9.39,19.59Z",
};

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const STRINGS = {
  en: {
    queries: "DNS queries",
    blocked: "Blocked",
    blocked_ratio: "Blocked ratio",
    avg_speed: "Processing time",
    domains_on_lists: "Domains on lists",
    rules: "rules",
    parental_blocked: "parental control",
    safe_browsing_blocked: "safe browsing",
    safe_searches: "safe searches",
    clients: "clients",
    unique_domains: "unique domains",
    cached: "cached",
    forwarded: "forwarded",
    seen_clients: "seen clients",
    status_on: "Protection on",
    status_off: "Protection off",
    status_paused: "Paused",
    unavailable: "Unavailable",
    unknown: "Unknown",
    no_device: "No AdGuard Home, Pi-hole or Technitium DNS entities found. Is one of these integrations installed?",
    unknown_device: "DNS filter not found",
    protection_on: "Turn protection on",
    protection_off: "Turn protection off",
    protection: "Protection",
    filtering: "Filtering",
    parental: "Parental control",
    safe_browsing: "Safe browsing",
    safe_search: "Safe search",
    query_log: "Query log",
    blocking: "Blocking",
    switches: "Settings",
    pause: "Pause blocking",
    pause_hint: "Blocking resumes by itself after the chosen time.",
    resume: "Resume blocking",
    indefinitely: "Until resumed",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Cancel",
    refresh: "Refresh filter lists",
    update_available: "Update available",
    version: "Version",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    open_ui: "Open the web interface",
    open_brand: "Open the {brand} website",
    // Editor
    device: "DNS filter (AdGuard Home, Pi-hole or Technitium DNS instance)",
    title: "Title (optional, defaults to the instance name)",
    url: "Web interface URL (click on the header icon)",
    url_helper: "Automatic from Home Assistant when empty (the device's « Visit » link)",
    show_stats: "Show statistics tiles",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_details: "Show detailed counters",
    show_switches: "Show settings switches",
    show_history: "Show 24 h history",
    show_versions: "Show versions",
    zoom: "Zoom button",
    zoom_helper: "Switches the mini card to the full card and back",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    queries: "Requêtes DNS",
    blocked: "Bloquées",
    blocked_ratio: "Taux de blocage",
    avg_speed: "Temps de traitement",
    domains_on_lists: "Domaines en liste",
    rules: "règles",
    parental_blocked: "contrôle parental",
    safe_browsing_blocked: "navigation sécurisée",
    safe_searches: "recherches sécurisées",
    clients: "clients",
    unique_domains: "domaines uniques",
    cached: "en cache",
    forwarded: "transférées",
    seen_clients: "clients vus",
    status_on: "Protection active",
    status_off: "Protection désactivée",
    status_paused: "En pause",
    unavailable: "Indisponible",
    unknown: "Inconnu",
    no_device: "Aucune entité AdGuard Home, Pi-hole ou Technitium DNS trouvée. L'une de ces intégrations est-elle installée ?",
    unknown_device: "Filtre DNS introuvable",
    protection_on: "Activer la protection",
    protection_off: "Désactiver la protection",
    protection: "Protection",
    filtering: "Filtrage",
    parental: "Contrôle parental",
    safe_browsing: "Navigation sécurisée",
    safe_search: "Recherche sécurisée",
    query_log: "Journal des requêtes",
    blocking: "Blocage",
    switches: "Réglages",
    pause: "Mettre le blocage en pause",
    pause_hint: "Le blocage reprend de lui-même après la durée choisie.",
    resume: "Reprendre le blocage",
    indefinitely: "Jusqu'à la reprise",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Annuler",
    refresh: "Actualiser les listes de filtres",
    update_available: "Mise à jour disponible",
    version: "Version",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    open_ui: "Ouvrir l'interface web",
    open_brand: "Ouvrir le site {brand}",
    device: "Filtre DNS (instance AdGuard Home, Pi-hole ou Technitium DNS)",
    title: "Titre (facultatif, nom de l'instance par défaut)",
    url: "URL de l'interface web (clic sur l'icône d'en-tête)",
    url_helper: "Automatique depuis Home Assistant si vide (lien « Visiter » de l'appareil)",
    show_stats: "Afficher les tuiles de statistiques",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_details: "Afficher les compteurs détaillés",
    show_switches: "Afficher les interrupteurs de réglage",
    show_history: "Afficher l’historique 24 h",
    show_versions: "Afficher les versions",
    zoom: "Bouton zoom",
    zoom_helper: "Bascule la mini-carte en carte complète, et inversement",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    queries: "DNS-Anfragen",
    blocked: "Blockiert",
    blocked_ratio: "Blockierrate",
    avg_speed: "Verarbeitungszeit",
    domains_on_lists: "Domains auf Listen",
    rules: "Regeln",
    parental_blocked: "Kindersicherung",
    safe_browsing_blocked: "sicheres Surfen",
    safe_searches: "sichere Suchen",
    clients: "Clients",
    unique_domains: "eindeutige Domains",
    cached: "aus dem Cache",
    forwarded: "weitergeleitet",
    seen_clients: "gesehene Clients",
    status_on: "Schutz aktiv",
    status_off: "Schutz aus",
    status_paused: "Pausiert",
    unavailable: "Nicht verfügbar",
    unknown: "Unbekannt",
    no_device: "Keine AdGuard-Home-, Pi-hole- oder Technitium-DNS-Entitäten gefunden. Ist eine dieser Integrationen installiert?",
    unknown_device: "DNS-Filter nicht gefunden",
    protection_on: "Schutz einschalten",
    protection_off: "Schutz ausschalten",
    protection: "Schutz",
    filtering: "Filterung",
    parental: "Kindersicherung",
    safe_browsing: "Sicheres Surfen",
    safe_search: "Sichere Suche",
    query_log: "Anfrageprotokoll",
    blocking: "Blockierung",
    switches: "Einstellungen",
    pause: "Blockierung pausieren",
    pause_hint: "Die Blockierung wird nach der gewählten Zeit automatisch fortgesetzt.",
    resume: "Blockierung fortsetzen",
    indefinitely: "Bis zum Fortsetzen",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Abbrechen",
    refresh: "Filterlisten aktualisieren",
    update_available: "Update verfügbar",
    version: "Version",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    open_ui: "Weboberfläche öffnen",
    open_brand: "Website von {brand} öffnen",
    device: "DNS-Filter (AdGuard-Home-, Pi-hole- oder Technitium-DNS-Instanz)",
    title: "Titel (optional, standardmäßig der Instanzname)",
    url: "URL der Weboberfläche (Klick auf das Kopfzeilensymbol)",
    url_helper: "Wenn leer, automatisch aus Home Assistant (Link „Besuchen“ des Geräts)",
    show_stats: "Statistikkacheln anzeigen",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_details: "Detaillierte Zähler anzeigen",
    show_switches: "Einstellungsschalter anzeigen",
    show_history: "24-h-Verlauf anzeigen",
    show_versions: "Versionen anzeigen",
    zoom: "Zoom-Schaltfläche",
    zoom_helper: "Wechselt von der Mini-Karte zur vollständigen Karte und zurück",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    queries: "Consultas DNS",
    blocked: "Bloqueadas",
    blocked_ratio: "Porcentaje bloqueado",
    avg_speed: "Tiempo de procesamiento",
    domains_on_lists: "Dominios en listas",
    rules: "reglas",
    parental_blocked: "control parental",
    safe_browsing_blocked: "navegación segura",
    safe_searches: "búsquedas seguras",
    clients: "clientes",
    unique_domains: "dominios únicos",
    cached: "en caché",
    forwarded: "reenviadas",
    seen_clients: "clientes vistos",
    status_on: "Protección activada",
    status_off: "Protección desactivada",
    status_paused: "En pausa",
    unavailable: "No disponible",
    unknown: "Desconocido",
    no_device: "No se han encontrado entidades de AdGuard Home, Pi-hole ni de Technitium DNS. ¿Está instalada una de estas integraciones?",
    unknown_device: "Filtro DNS no encontrado",
    protection_on: "Activar la protección",
    protection_off: "Desactivar la protección",
    protection: "Protección",
    filtering: "Filtrado",
    parental: "Control parental",
    safe_browsing: "Navegación segura",
    safe_search: "Búsqueda segura",
    query_log: "Registro de consultas",
    blocking: "Bloqueo",
    switches: "Ajustes",
    pause: "Pausar el bloqueo",
    pause_hint: "El bloqueo se reanuda solo tras el tiempo elegido.",
    resume: "Reanudar el bloqueo",
    indefinitely: "Hasta reanudar",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Cancelar",
    refresh: "Actualizar las listas de filtros",
    update_available: "Actualización disponible",
    version: "Versión",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    open_ui: "Abrir la interfaz web",
    open_brand: "Abrir el sitio web de {brand}",
    device: "Filtro DNS (instancia de AdGuard Home, Pi-hole o Technitium DNS)",
    title: "Título (opcional, por defecto el nombre de la instancia)",
    url: "URL de la interfaz web (clic en el icono de la cabecera)",
    url_helper: "Automática desde Home Assistant si está vacía (enlace « Visitar » del dispositivo)",
    show_stats: "Mostrar las tarjetas de estadísticas",
    show_title: "Mostrar el título",
    show_subtitle: "Mostrar el subtítulo",
    show_details: "Mostrar los contadores detallados",
    show_switches: "Mostrar los interruptores de ajustes",
    show_history: "Mostrar el historial de 24 h",
    show_versions: "Mostrar las versiones",
    zoom: "Botón de zoom",
    zoom_helper: "Cambia la minitarjeta a la tarjeta completa y viceversa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  sr: {
    queries: "DNS упити",
    blocked: "Блокирано",
    blocked_ratio: "Удео блокираних",
    avg_speed: "Време обраде",
    domains_on_lists: "Домени на листама",
    rules: "правила",
    parental_blocked: "родитељска контрола",
    safe_browsing_blocked: "безбедно прегледање",
    safe_searches: "безбедне претраге",
    clients: "клијената",
    unique_domains: "јединствених домена",
    cached: "из кеша",
    forwarded: "прослеђено",
    seen_clients: "виђених клијената",
    status_on: "Заштита укључена",
    status_off: "Заштита искључена",
    status_paused: "Паузирано",
    unavailable: "Недоступно",
    unknown: "Непознато",
    no_device: "Нису пронађени AdGuard Home, Pi-hole или Technitium DNS ентитети. Да ли је инсталирана нека од ових интеграција?",
    unknown_device: "DNS филтер није пронађен",
    protection_on: "Укључи заштиту",
    protection_off: "Искључи заштиту",
    protection: "Заштита",
    filtering: "Филтрирање",
    parental: "Родитељска контрола",
    safe_browsing: "Безбедно прегледање",
    safe_search: "Безбедна претрага",
    query_log: "Дневник упита",
    blocking: "Блокирање",
    switches: "Подешавања",
    pause: "Паузирај блокирање",
    pause_hint: "Блокирање се само наставља након изабраног времена.",
    resume: "Настави блокирање",
    indefinitely: "До наставка",
    minutes_n: "{n} мин",
    hours_n: "{n} ч",
    cancel: "Откажи",
    refresh: "Освежи листе филтера",
    update_available: "Доступно ажурирање",
    version: "Верзија",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    open_ui: "Отвори веб интерфејс",
    open_brand: "Отвори веб-сајт {brand}",
    device: "DNS филтер (AdGuard Home, Pi-hole или Technitium DNS инстанца)",
    title: "Наслов (опционо, подразумевано је назив инстанце)",
    url: "URL веб интерфејса (клик на икону заглавља)",
    url_helper: "Ако је празно, аутоматски из Home Assistant-а (веза „Посети“ уређаја)",
    show_stats: "Прикажи плочице статистике",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_details: "Прикажи детаљне бројаче",
    show_switches: "Прикажи прекидаче подешавања",
    show_history: "Прикажи историју за 24 ч",
    show_versions: "Прикажи верзије",
    zoom: "Дугме за увећање",
    zoom_helper: "Пребацује мини картицу на пун приказ и назад",
    language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    queries: "DNS upiti",
    blocked: "Blokirano",
    blocked_ratio: "Udeo blokiranih",
    avg_speed: "Vreme obrade",
    domains_on_lists: "Domeni na listama",
    rules: "pravila",
    parental_blocked: "roditeljska kontrola",
    safe_browsing_blocked: "bezbedno pregledanje",
    safe_searches: "bezbedne pretrage",
    clients: "klijenata",
    unique_domains: "jedinstvenih domena",
    cached: "iz keša",
    forwarded: "prosleđeno",
    seen_clients: "viđenih klijenata",
    status_on: "Zaštita uključena",
    status_off: "Zaštita isključena",
    status_paused: "Pauzirano",
    unavailable: "Nedostupno",
    unknown: "Nepoznato",
    no_device: "Nisu pronađeni AdGuard Home, Pi-hole ili Technitium DNS entiteti. Da li je instalirana neka od ovih integracija?",
    unknown_device: "DNS filter nije pronađen",
    protection_on: "Uključi zaštitu",
    protection_off: "Isključi zaštitu",
    protection: "Zaštita",
    filtering: "Filtriranje",
    parental: "Roditeljska kontrola",
    safe_browsing: "Bezbedno pregledanje",
    safe_search: "Bezbedna pretraga",
    query_log: "Dnevnik upita",
    blocking: "Blokiranje",
    switches: "Podešavanja",
    pause: "Pauziraj blokiranje",
    pause_hint: "Blokiranje se samo nastavlja nakon izabranog vremena.",
    resume: "Nastavi blokiranje",
    indefinitely: "Do nastavka",
    minutes_n: "{n} min",
    hours_n: "{n} č",
    cancel: "Otkaži",
    refresh: "Osveži liste filtera",
    update_available: "Dostupno ažuriranje",
    version: "Verzija",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    open_ui: "Otvori veb interfejs",
    open_brand: "Otvori veb-sajt {brand}",
    device: "DNS filter (AdGuard Home, Pi-hole ili Technitium DNS instanca)",
    title: "Naslov (opciono, podrazumevano je naziv instance)",
    url: "URL veb interfejsa (klik na ikonu zaglavlja)",
    url_helper: "Ako je prazno, automatski iz Home Assistant-a (veza „Poseti“ uređaja)",
    show_stats: "Prikaži pločice statistike",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_details: "Prikaži detaljne brojače",
    show_switches: "Prikaži prekidače podešavanja",
    show_history: "Prikaži istoriju za 24 č",
    show_versions: "Prikaži verzije",
    zoom: "Dugme za uvećanje",
    zoom_helper: "Prebacuje mini karticu na pun prikaz i nazad",
    language: "Jezik",
    lang_auto: "Automatski",
  },
  it: {
    queries: "Richieste DNS",
    blocked: "Bloccate",
    blocked_ratio: "Percentuale bloccata",
    avg_speed: "Tempo di elaborazione",
    domains_on_lists: "Domini nelle liste",
    rules: "regole",
    parental_blocked: "controllo genitori",
    safe_browsing_blocked: "navigazione sicura",
    safe_searches: "ricerche sicure",
    clients: "client",
    unique_domains: "domini unici",
    cached: "dalla cache",
    forwarded: "inoltrate",
    seen_clients: "client visti",
    status_on: "Protezione attiva",
    status_off: "Protezione disattivata",
    status_paused: "In pausa",
    unavailable: "Non disponibile",
    unknown: "Sconosciuto",
    no_device: "Nessuna entità AdGuard Home, Pi-hole o Technitium DNS trovata. È installata una di queste integrazioni?",
    unknown_device: "Filtro DNS non trovato",
    protection_on: "Attiva la protezione",
    protection_off: "Disattiva la protezione",
    protection: "Protezione",
    filtering: "Filtraggio",
    parental: "Controllo genitori",
    safe_browsing: "Navigazione sicura",
    safe_search: "Ricerca sicura",
    query_log: "Registro delle richieste",
    blocking: "Blocco",
    switches: "Impostazioni",
    pause: "Metti in pausa il blocco",
    pause_hint: "Il blocco riprende da solo dopo il tempo scelto.",
    resume: "Riprendi il blocco",
    indefinitely: "Fino alla ripresa",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Annulla",
    refresh: "Aggiorna le liste dei filtri",
    update_available: "Aggiornamento disponibile",
    version: "Versione",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    open_ui: "Apri l'interfaccia web",
    open_brand: "Apri il sito di {brand}",
    device: "Filtro DNS (istanza AdGuard Home, Pi-hole o Technitium DNS)",
    title: "Titolo (facoltativo, per impostazione predefinita il nome dell'istanza)",
    url: "URL dell'interfaccia web (clic sull'icona dell'intestazione)",
    url_helper: "Automatico da Home Assistant se vuoto (link « Visita » del dispositivo)",
    show_stats: "Mostra i riquadri delle statistiche",
    show_title: "Mostra il titolo",
    show_subtitle: "Mostra il sottotitolo",
    show_details: "Mostra i contatori dettagliati",
    show_switches: "Mostra gli interruttori delle impostazioni",
    show_history: "Mostra lo storico delle 24 h",
    show_versions: "Mostra le versioni",
    zoom: "Pulsante zoom",
    zoom_helper: "Passa dalla mini scheda alla scheda completa e viceversa",
    language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    queries: "DNS-verzoeken",
    blocked: "Geblokkeerd",
    blocked_ratio: "Blokkeringspercentage",
    avg_speed: "Verwerkingstijd",
    domains_on_lists: "Domeinen op lijsten",
    rules: "regels",
    parental_blocked: "ouderlijk toezicht",
    safe_browsing_blocked: "veilig browsen",
    safe_searches: "veilige zoekopdrachten",
    clients: "clients",
    unique_domains: "unieke domeinen",
    cached: "uit cache",
    forwarded: "doorgestuurd",
    seen_clients: "geziene clients",
    status_on: "Bescherming aan",
    status_off: "Bescherming uit",
    status_paused: "Gepauzeerd",
    unavailable: "Niet beschikbaar",
    unknown: "Onbekend",
    no_device: "Geen AdGuard Home-, Pi-hole- of Technitium-DNS-entiteiten gevonden. Is een van deze integraties geïnstalleerd?",
    unknown_device: "DNS-filter niet gevonden",
    protection_on: "Bescherming inschakelen",
    protection_off: "Bescherming uitschakelen",
    protection: "Bescherming",
    filtering: "Filtering",
    parental: "Ouderlijk toezicht",
    safe_browsing: "Veilig browsen",
    safe_search: "Veilig zoeken",
    query_log: "Verzoekenlogboek",
    blocking: "Blokkering",
    switches: "Instellingen",
    pause: "Blokkering pauzeren",
    pause_hint: "De blokkering wordt na de gekozen tijd vanzelf hervat.",
    resume: "Blokkering hervatten",
    indefinitely: "Tot hervatting",
    minutes_n: "{n} min",
    hours_n: "{n} u",
    cancel: "Annuleren",
    refresh: "Filterlijsten vernieuwen",
    update_available: "Update beschikbaar",
    version: "Versie",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    open_ui: "Webinterface openen",
    open_brand: "Website van {brand} openen",
    device: "DNS-filter (AdGuard Home-, Pi-hole- of Technitium-DNS-instantie)",
    title: "Titel (optioneel, standaard de naam van de instantie)",
    url: "URL van de webinterface (klik op het koppictogram)",
    url_helper: "Automatisch uit Home Assistant indien leeg (link « Bezoeken » van het apparaat)",
    show_stats: "Statistiektegels tonen",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_details: "Gedetailleerde tellers tonen",
    show_switches: "Instellingsschakelaars tonen",
    show_history: "24-uursgeschiedenis tonen",
    show_versions: "Versies tonen",
    zoom: "Zoomknop",
    zoom_helper: "Schakelt de minikaart om naar de volledige kaart en terug",
    language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    queries: "Pedidos DNS",
    blocked: "Bloqueados",
    blocked_ratio: "Taxa de bloqueio",
    avg_speed: "Tempo de processamento",
    domains_on_lists: "Domínios em listas",
    rules: "regras",
    parental_blocked: "controlo parental",
    safe_browsing_blocked: "navegação segura",
    safe_searches: "pesquisas seguras",
    clients: "clientes",
    unique_domains: "domínios únicos",
    cached: "em cache",
    forwarded: "reencaminhados",
    seen_clients: "clientes vistos",
    status_on: "Proteção ativa",
    status_off: "Proteção desativada",
    status_paused: "Em pausa",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    no_device: "Não foram encontradas entidades AdGuard Home, Pi-hole ou Technitium DNS. Está instalada uma destas integrações?",
    unknown_device: "Filtro DNS não encontrado",
    protection_on: "Ativar a proteção",
    protection_off: "Desativar a proteção",
    protection: "Proteção",
    filtering: "Filtragem",
    parental: "Controlo parental",
    safe_browsing: "Navegação segura",
    safe_search: "Pesquisa segura",
    query_log: "Registo de pedidos",
    blocking: "Bloqueio",
    switches: "Definições",
    pause: "Pausar o bloqueio",
    pause_hint: "O bloqueio retoma sozinho após o tempo escolhido.",
    resume: "Retomar o bloqueio",
    indefinitely: "Até retomar",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Cancelar",
    refresh: "Atualizar as listas de filtros",
    update_available: "Atualização disponível",
    version: "Versão",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    open_ui: "Abrir a interface web",
    open_brand: "Abrir o site da {brand}",
    device: "Filtro DNS (instância AdGuard Home, Pi-hole ou Technitium DNS)",
    title: "Título (opcional, por omissão o nome da instância)",
    url: "URL da interface web (clique no ícone do cabeçalho)",
    url_helper: "Automático a partir do Home Assistant se vazio (ligação « Visitar » do dispositivo)",
    show_stats: "Mostrar os mosaicos de estatísticas",
    show_title: "Mostrar o título",
    show_subtitle: "Mostrar o subtítulo",
    show_details: "Mostrar os contadores detalhados",
    show_switches: "Mostrar os interruptores de definições",
    show_history: "Mostrar o histórico de 24 h",
    show_versions: "Mostrar as versões",
    zoom: "Botão de zoom",
    zoom_helper: "Alterna o minicartão para o cartão completo e vice-versa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    queries: "Zapytania DNS",
    blocked: "Zablokowane",
    blocked_ratio: "Odsetek zablokowanych",
    avg_speed: "Czas przetwarzania",
    domains_on_lists: "Domeny na listach",
    rules: "reguł",
    parental_blocked: "kontrola rodzicielska",
    safe_browsing_blocked: "bezpieczne przeglądanie",
    safe_searches: "bezpieczne wyszukiwania",
    clients: "klientów",
    unique_domains: "unikalnych domen",
    cached: "z pamięci podręcznej",
    forwarded: "przekazanych",
    seen_clients: "widzianych klientów",
    status_on: "Ochrona włączona",
    status_off: "Ochrona wyłączona",
    status_paused: "Wstrzymano",
    unavailable: "Niedostępne",
    unknown: "Nieznane",
    no_device: "Nie znaleziono encji AdGuard Home, Pi-hole ani Technitium DNS. Czy jedna z tych integracji jest zainstalowana?",
    unknown_device: "Nie znaleziono filtra DNS",
    protection_on: "Włącz ochronę",
    protection_off: "Wyłącz ochronę",
    protection: "Ochrona",
    filtering: "Filtrowanie",
    parental: "Kontrola rodzicielska",
    safe_browsing: "Bezpieczne przeglądanie",
    safe_search: "Bezpieczne wyszukiwanie",
    query_log: "Dziennik zapytań",
    blocking: "Blokowanie",
    switches: "Ustawienia",
    pause: "Wstrzymaj blokowanie",
    pause_hint: "Blokowanie wznowi się samo po wybranym czasie.",
    resume: "Wznów blokowanie",
    indefinitely: "Do wznowienia",
    minutes_n: "{n} min",
    hours_n: "{n} godz.",
    cancel: "Anuluj",
    refresh: "Odśwież listy filtrów",
    update_available: "Dostępna aktualizacja",
    version: "Wersja",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    open_ui: "Otwórz interfejs webowy",
    open_brand: "Otwórz stronę {brand}",
    device: "Filtr DNS (instancja AdGuard Home, Pi-hole lub Technitium DNS)",
    title: "Tytuł (opcjonalny, domyślnie nazwa instancji)",
    url: "URL interfejsu webowego (kliknięcie ikony nagłówka)",
    url_helper: "Automatycznie z Home Assistant, gdy puste (link „Odwiedź” urządzenia)",
    show_stats: "Pokaż kafelki statystyk",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_details: "Pokaż szczegółowe liczniki",
    show_switches: "Pokaż przełączniki ustawień",
    show_history: "Pokaż historię 24 h",
    show_versions: "Pokaż wersje",
    zoom: "Przycisk powiększenia",
    zoom_helper: "Przełącza minikartę na pełną kartę i z powrotem",
    language: "Język",
    lang_auto: "Automatycznie",
  },
  ro: {
    queries: "Interogări DNS",
    blocked: "Blocate",
    blocked_ratio: "Procent blocat",
    avg_speed: "Timp de procesare",
    domains_on_lists: "Domenii în liste",
    rules: "reguli",
    parental_blocked: "control parental",
    safe_browsing_blocked: "navigare sigură",
    safe_searches: "căutări sigure",
    clients: "clienți",
    unique_domains: "domenii unice",
    cached: "din cache",
    forwarded: "redirecționate",
    seen_clients: "clienți văzuți",
    status_on: "Protecție activă",
    status_off: "Protecție dezactivată",
    status_paused: "În pauză",
    unavailable: "Indisponibil",
    unknown: "Necunoscut",
    no_device: "Nu s-au găsit entități AdGuard Home, Pi-hole sau Technitium DNS. Este instalată una dintre aceste integrări?",
    unknown_device: "Filtrul DNS nu a fost găsit",
    protection_on: "Activează protecția",
    protection_off: "Dezactivează protecția",
    protection: "Protecție",
    filtering: "Filtrare",
    parental: "Control parental",
    safe_browsing: "Navigare sigură",
    safe_search: "Căutare sigură",
    query_log: "Jurnal de interogări",
    blocking: "Blocare",
    switches: "Setări",
    pause: "Pune blocarea în pauză",
    pause_hint: "Blocarea se reia singură după timpul ales.",
    resume: "Reia blocarea",
    indefinitely: "Până la reluare",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Anulează",
    refresh: "Actualizează listele de filtre",
    update_available: "Actualizare disponibilă",
    version: "Versiune",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    open_ui: "Deschide interfața web",
    open_brand: "Deschide site-ul {brand}",
    device: "Filtru DNS (instanță AdGuard Home, Pi-hole sau Technitium DNS)",
    title: "Titlu (opțional, implicit numele instanței)",
    url: "URL-ul interfeței web (clic pe pictograma antetului)",
    url_helper: "Automat din Home Assistant dacă este gol (linkul „Vizitează” al dispozitivului)",
    show_stats: "Afișează plăcuțele de statistici",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_details: "Afișează contoarele detaliate",
    show_switches: "Afișează comutatoarele de setări",
    show_history: "Afișează istoricul de 24 h",
    show_versions: "Afișează versiunile",
    zoom: "Buton de zoom",
    zoom_helper: "Comută mini-cardul la cardul complet și înapoi",
    language: "Limbă",
    lang_auto: "Automat",
  },
  da: {
    queries: "DNS-forespørgsler",
    blocked: "Blokeret",
    blocked_ratio: "Blokeringsandel",
    avg_speed: "Behandlingstid",
    domains_on_lists: "Domæner på lister",
    rules: "regler",
    parental_blocked: "forældrekontrol",
    safe_browsing_blocked: "sikker browsing",
    safe_searches: "sikre søgninger",
    clients: "klienter",
    unique_domains: "unikke domæner",
    cached: "fra cache",
    forwarded: "videresendt",
    seen_clients: "sete klienter",
    status_on: "Beskyttelse til",
    status_off: "Beskyttelse fra",
    status_paused: "Sat på pause",
    unavailable: "Ikke tilgængelig",
    unknown: "Ukendt",
    no_device: "Ingen AdGuard Home-, Pi-hole- eller Technitium-DNS-enheder fundet. Er en af disse integrationer installeret?",
    unknown_device: "DNS-filter ikke fundet",
    protection_on: "Slå beskyttelse til",
    protection_off: "Slå beskyttelse fra",
    protection: "Beskyttelse",
    filtering: "Filtrering",
    parental: "Forældrekontrol",
    safe_browsing: "Sikker browsing",
    safe_search: "Sikker søgning",
    query_log: "Forespørgselslog",
    blocking: "Blokering",
    switches: "Indstillinger",
    pause: "Sæt blokering på pause",
    pause_hint: "Blokeringen genoptages af sig selv efter den valgte tid.",
    resume: "Genoptag blokering",
    indefinitely: "Indtil genoptagelse",
    minutes_n: "{n} min",
    hours_n: "{n} t",
    cancel: "Annuller",
    refresh: "Opdater filterlister",
    update_available: "Opdatering tilgængelig",
    version: "Version",
    zoom_in: "Vis det fulde kort",
    zoom_out: "Tilbage til den kompakte visning",
    open_ui: "Åbn webgrænsefladen",
    open_brand: "Åbn {brand}s websted",
    device: "DNS-filter (AdGuard Home-, Pi-hole- eller Technitium-DNS-instans)",
    title: "Titel (valgfri, som standard instansens navn)",
    url: "URL til webgrænsefladen (klik på ikonet i overskriften)",
    url_helper: "Automatisk fra Home Assistant når tom (enhedens « Besøg »-link)",
    show_stats: "Vis statistikfelter",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_details: "Vis detaljerede tællere",
    show_switches: "Vis indstillingskontakter",
    show_history: "Vis 24 timers historik",
    show_versions: "Vis versioner",
    zoom: "Zoomknap",
    zoom_helper: "Skifter minikortet til det fulde kort og tilbage",
    language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    queries: "DNS-frågor",
    blocked: "Blockerade",
    blocked_ratio: "Blockeringsandel",
    avg_speed: "Bearbetningstid",
    domains_on_lists: "Domäner på listor",
    rules: "regler",
    parental_blocked: "föräldrakontroll",
    safe_browsing_blocked: "säker surfning",
    safe_searches: "säkra sökningar",
    clients: "klienter",
    unique_domains: "unika domäner",
    cached: "från cache",
    forwarded: "vidarebefordrade",
    seen_clients: "sedda klienter",
    status_on: "Skydd på",
    status_off: "Skydd av",
    status_paused: "Pausat",
    unavailable: "Otillgänglig",
    unknown: "Okänd",
    no_device: "Inga AdGuard Home-, Pi-hole- eller Technitium-DNS-entiteter hittades. Är någon av dessa integrationer installerad?",
    unknown_device: "DNS-filter hittades inte",
    protection_on: "Slå på skyddet",
    protection_off: "Stäng av skyddet",
    protection: "Skydd",
    filtering: "Filtrering",
    parental: "Föräldrakontroll",
    safe_browsing: "Säker surfning",
    safe_search: "Säker sökning",
    query_log: "Frågelogg",
    blocking: "Blockering",
    switches: "Inställningar",
    pause: "Pausa blockering",
    pause_hint: "Blockeringen återupptas av sig själv efter den valda tiden.",
    resume: "Återuppta blockering",
    indefinitely: "Tills den återupptas",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Avbryt",
    refresh: "Uppdatera filterlistor",
    update_available: "Uppdatering tillgänglig",
    version: "Version",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till den kompakta vyn",
    open_ui: "Öppna webbgränssnittet",
    open_brand: "Öppna {brand}s webbplats",
    device: "DNS-filter (AdGuard Home-, Pi-hole- eller Technitium-DNS-instans)",
    title: "Titel (valfri, som standard instansens namn)",
    url: "URL till webbgränssnittet (klick på rubrikikonen)",
    url_helper: "Automatiskt från Home Assistant om tomt (enhetens « Besök »-länk)",
    show_stats: "Visa statistikrutor",
    show_title: "Visa rubrik",
    show_subtitle: "Visa underrubrik",
    show_details: "Visa detaljerade räknare",
    show_switches: "Visa inställningsbrytare",
    show_history: "Visa 24-timmarshistorik",
    show_versions: "Visa versioner",
    zoom: "Zoomknapp",
    zoom_helper: "Växlar minikortet till hela kortet och tillbaka",
    language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    queries: "DNS заявки",
    blocked: "Блокирани",
    blocked_ratio: "Дял блокирани",
    avg_speed: "Време за обработка",
    domains_on_lists: "Домейни в списъци",
    rules: "правила",
    parental_blocked: "родителски контрол",
    safe_browsing_blocked: "безопасно сърфиране",
    safe_searches: "безопасни търсения",
    clients: "клиенти",
    unique_domains: "уникални домейни",
    cached: "от кеша",
    forwarded: "препратени",
    seen_clients: "видени клиенти",
    status_on: "Защитата е включена",
    status_off: "Защитата е изключена",
    status_paused: "На пауза",
    unavailable: "Недостъпно",
    unknown: "Неизвестно",
    no_device: "Не са намерени обекти на AdGuard Home, Pi-hole или Technitium DNS. Инсталирана ли е някоя от тези интеграции?",
    unknown_device: "DNS филтърът не е намерен",
    protection_on: "Включи защитата",
    protection_off: "Изключи защитата",
    protection: "Защита",
    filtering: "Филтриране",
    parental: "Родителски контрол",
    safe_browsing: "Безопасно сърфиране",
    safe_search: "Безопасно търсене",
    query_log: "Дневник на заявките",
    blocking: "Блокиране",
    switches: "Настройки",
    pause: "Пауза на блокирането",
    pause_hint: "Блокирането се възобновява само след избраното време.",
    resume: "Възобнови блокирането",
    indefinitely: "До възобновяване",
    minutes_n: "{n} мин",
    hours_n: "{n} ч",
    cancel: "Отказ",
    refresh: "Обнови списъците с филтри",
    update_available: "Налична е актуализация",
    version: "Версия",
    zoom_in: "Покажи пълната карта",
    zoom_out: "Обратно към компактния изглед",
    open_ui: "Отвори уеб интерфейса",
    open_brand: "Отвори сайта на {brand}",
    device: "DNS филтър (инстанция AdGuard Home, Pi-hole или Technitium DNS)",
    title: "Заглавие (по избор, по подразбиране името на инстанцията)",
    url: "URL на уеб интерфейса (клик върху иконата в заглавието)",
    url_helper: "Автоматично от Home Assistant, ако е празно (връзката „Посети“ на устройството)",
    show_stats: "Покажи плочките със статистика",
    show_title: "Показване на заглавието",
    show_subtitle: "Показване на подзаглавието",
    show_details: "Покажи подробните броячи",
    show_switches: "Покажи превключвателите за настройки",
    show_history: "Покажи историята за 24 ч",
    show_versions: "Покажи версиите",
    zoom: "Бутон за увеличение",
    zoom_helper: "Превключва мини картата към пълната карта и обратно",
    language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    queries: "DNS-запросы",
    blocked: "Заблокировано",
    blocked_ratio: "Доля заблокированных",
    avg_speed: "Время обработки",
    domains_on_lists: "Доменов в списках",
    rules: "правил",
    parental_blocked: "родительский контроль",
    safe_browsing_blocked: "безопасный просмотр",
    safe_searches: "безопасных поисков",
    clients: "клиентов",
    unique_domains: "уникальных доменов",
    cached: "из кэша",
    forwarded: "перенаправлено",
    seen_clients: "замеченных клиентов",
    status_on: "Защита включена",
    status_off: "Защита выключена",
    status_paused: "Приостановлено",
    unavailable: "Недоступно",
    unknown: "Неизвестно",
    no_device: "Объекты AdGuard Home, Pi-hole или Technitium DNS не найдены. Установлена ли одна из этих интеграций?",
    unknown_device: "DNS-фильтр не найден",
    protection_on: "Включить защиту",
    protection_off: "Выключить защиту",
    protection: "Защита",
    filtering: "Фильтрация",
    parental: "Родительский контроль",
    safe_browsing: "Безопасный просмотр",
    safe_search: "Безопасный поиск",
    query_log: "Журнал запросов",
    blocking: "Блокировка",
    switches: "Настройки",
    pause: "Приостановить блокировку",
    pause_hint: "Блокировка возобновится сама по истечении выбранного времени.",
    resume: "Возобновить блокировку",
    indefinitely: "До возобновления",
    minutes_n: "{n} мин",
    hours_n: "{n} ч",
    cancel: "Отмена",
    refresh: "Обновить списки фильтров",
    update_available: "Доступно обновление",
    version: "Версия",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    open_ui: "Открыть веб-интерфейс",
    open_brand: "Открыть сайт {brand}",
    device: "DNS-фильтр (экземпляр AdGuard Home, Pi-hole или Technitium DNS)",
    title: "Заголовок (необязательно, по умолчанию имя экземпляра)",
    url: "URL веб-интерфейса (клик по значку в заголовке)",
    url_helper: "Автоматически из Home Assistant, если пусто (ссылка «Посетить» устройства)",
    show_stats: "Показывать плитки статистики",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_details: "Показывать подробные счётчики",
    show_switches: "Показывать переключатели настроек",
    show_history: "Показывать историю за 24 ч",
    show_versions: "Показывать версии",
    zoom: "Кнопка увеличения",
    zoom_helper: "Переключает мини-карточку на полную и обратно",
    language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    queries: "DNS-запити",
    blocked: "Заблоковано",
    blocked_ratio: "Частка заблокованих",
    avg_speed: "Час обробки",
    domains_on_lists: "Доменів у списках",
    rules: "правил",
    parental_blocked: "батьківський контроль",
    safe_browsing_blocked: "безпечний перегляд",
    safe_searches: "безпечних пошуків",
    clients: "клієнтів",
    unique_domains: "унікальних доменів",
    cached: "з кешу",
    forwarded: "переспрямовано",
    seen_clients: "помічених клієнтів",
    status_on: "Захист увімкнено",
    status_off: "Захист вимкнено",
    status_paused: "Призупинено",
    unavailable: "Недоступно",
    unknown: "Невідомо",
    no_device: "Сутності AdGuard Home, Pi-hole або Technitium DNS не знайдено. Чи встановлено одну з цих інтеграцій?",
    unknown_device: "DNS-фільтр не знайдено",
    protection_on: "Увімкнути захист",
    protection_off: "Вимкнути захист",
    protection: "Захист",
    filtering: "Фільтрація",
    parental: "Батьківський контроль",
    safe_browsing: "Безпечний перегляд",
    safe_search: "Безпечний пошук",
    query_log: "Журнал запитів",
    blocking: "Блокування",
    switches: "Налаштування",
    pause: "Призупинити блокування",
    pause_hint: "Блокування відновиться саме після обраного часу.",
    resume: "Відновити блокування",
    indefinitely: "До відновлення",
    minutes_n: "{n} хв",
    hours_n: "{n} год",
    cancel: "Скасувати",
    refresh: "Оновити списки фільтрів",
    update_available: "Доступне оновлення",
    version: "Версія",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    open_ui: "Відкрити вебінтерфейс",
    open_brand: "Відкрити сайт {brand}",
    device: "DNS-фільтр (екземпляр AdGuard Home, Pi-hole або Technitium DNS)",
    title: "Заголовок (необов'язково, типово ім'я екземпляра)",
    url: "URL вебінтерфейсу (клік на значок у заголовку)",
    url_helper: "Автоматично з Home Assistant, якщо порожньо (посилання «Відвідати» пристрою)",
    show_stats: "Показувати плитки статистики",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_details: "Показувати детальні лічильники",
    show_switches: "Показувати перемикачі налаштувань",
    show_history: "Показувати історію за 24 год",
    show_versions: "Показувати версії",
    zoom: "Кнопка збільшення",
    zoom_helper: "Перемикає міні-картку на повну та назад",
    language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    queries: "DNS-lekérdezések",
    blocked: "Blokkolva",
    blocked_ratio: "Blokkolási arány",
    avg_speed: "Feldolgozási idő",
    domains_on_lists: "Domainek a listákon",
    rules: "szabály",
    parental_blocked: "szülői felügyelet",
    safe_browsing_blocked: "biztonságos böngészés",
    safe_searches: "biztonságos keresés",
    clients: "kliens",
    unique_domains: "egyedi domain",
    cached: "gyorsítótárból",
    forwarded: "továbbítva",
    seen_clients: "látott kliens",
    status_on: "Védelem bekapcsolva",
    status_off: "Védelem kikapcsolva",
    status_paused: "Szüneteltetve",
    unavailable: "Nem elérhető",
    unknown: "Ismeretlen",
    no_device: "Nem található AdGuard Home, Pi-hole vagy Technitium DNS entitás. Telepítve van valamelyik integráció?",
    unknown_device: "A DNS-szűrő nem található",
    protection_on: "Védelem bekapcsolása",
    protection_off: "Védelem kikapcsolása",
    protection: "Védelem",
    filtering: "Szűrés",
    parental: "Szülői felügyelet",
    safe_browsing: "Biztonságos böngészés",
    safe_search: "Biztonságos keresés",
    query_log: "Lekérdezésnapló",
    blocking: "Blokkolás",
    switches: "Beállítások",
    pause: "Blokkolás szüneteltetése",
    pause_hint: "A blokkolás a kiválasztott idő után magától folytatódik.",
    resume: "Blokkolás folytatása",
    indefinitely: "A folytatásig",
    minutes_n: "{n} perc",
    hours_n: "{n} óra",
    cancel: "Mégse",
    refresh: "Szűrőlisták frissítése",
    update_available: "Frissítés érhető el",
    version: "Verzió",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    open_ui: "Webes felület megnyitása",
    open_brand: "A(z) {brand} webhelyének megnyitása",
    device: "DNS-szűrő (AdGuard Home, Pi-hole vagy Technitium DNS példány)",
    title: "Cím (nem kötelező, alapértelmezés szerint a példány neve)",
    url: "A webes felület URL-je (kattintás a fejléc ikonjára)",
    url_helper: "Ha üres, automatikusan a Home Assistantból (az eszköz „Megtekintés” hivatkozása)",
    show_stats: "Statisztikai csempék megjelenítése",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_details: "Részletes számlálók megjelenítése",
    show_switches: "Beállítási kapcsolók megjelenítése",
    show_history: "24 órás előzmények megjelenítése",
    show_versions: "Verziók megjelenítése",
    zoom: "Nagyítás gomb",
    zoom_helper: "A minikártyát teljes kártyára váltja és vissza",
    language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    queries: "DNS dopyty",
    blocked: "Blokované",
    blocked_ratio: "Podiel blokovaných",
    avg_speed: "Čas spracovania",
    domains_on_lists: "Domény v zoznamoch",
    rules: "pravidiel",
    parental_blocked: "rodičovská kontrola",
    safe_browsing_blocked: "bezpečné prehliadanie",
    safe_searches: "bezpečné vyhľadávania",
    clients: "klientov",
    unique_domains: "jedinečných domén",
    cached: "z vyrovnávacej pamäte",
    forwarded: "preposlaných",
    seen_clients: "videných klientov",
    status_on: "Ochrana zapnutá",
    status_off: "Ochrana vypnutá",
    status_paused: "Pozastavené",
    unavailable: "Nedostupné",
    unknown: "Neznáme",
    no_device: "Nenašli sa žiadne entity AdGuard Home, Pi-hole ani Technitium DNS. Je nainštalovaná niektorá z týchto integrácií?",
    unknown_device: "DNS filter sa nenašiel",
    protection_on: "Zapnúť ochranu",
    protection_off: "Vypnúť ochranu",
    protection: "Ochrana",
    filtering: "Filtrovanie",
    parental: "Rodičovská kontrola",
    safe_browsing: "Bezpečné prehliadanie",
    safe_search: "Bezpečné vyhľadávanie",
    query_log: "Denník dopytov",
    blocking: "Blokovanie",
    switches: "Nastavenia",
    pause: "Pozastaviť blokovanie",
    pause_hint: "Blokovanie sa po zvolenom čase samo obnoví.",
    resume: "Obnoviť blokovanie",
    indefinitely: "Do obnovenia",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Zrušiť",
    refresh: "Obnoviť zoznamy filtrov",
    update_available: "K dispozícii je aktualizácia",
    version: "Verzia",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    open_ui: "Otvoriť webové rozhranie",
    open_brand: "Otvoriť web {brand}",
    device: "DNS filter (inštancia AdGuard Home, Pi-hole alebo Technitium DNS)",
    title: "Názov (voliteľný, predvolene názov inštancie)",
    url: "URL webového rozhrania (kliknutie na ikonu hlavičky)",
    url_helper: "Ak je prázdne, automaticky z Home Assistanta (odkaz „Navštíviť“ zariadenia)",
    show_stats: "Zobraziť dlaždice štatistík",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnázov",
    show_details: "Zobraziť podrobné počítadlá",
    show_switches: "Zobraziť prepínače nastavení",
    show_history: "Zobraziť 24-hodinovú históriu",
    show_versions: "Zobraziť verzie",
    zoom: "Tlačidlo priblíženia",
    zoom_helper: "Prepne mini kartu na celú kartu a späť",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    queries: "DNS dotazy",
    blocked: "Blokované",
    blocked_ratio: "Podíl blokovaných",
    avg_speed: "Doba zpracování",
    domains_on_lists: "Domény v seznamech",
    rules: "pravidel",
    parental_blocked: "rodičovská kontrola",
    safe_browsing_blocked: "bezpečné prohlížení",
    safe_searches: "bezpečná vyhledávání",
    clients: "klientů",
    unique_domains: "jedinečných domén",
    cached: "z mezipaměti",
    forwarded: "přeposlaných",
    seen_clients: "viděných klientů",
    status_on: "Ochrana zapnuta",
    status_off: "Ochrana vypnuta",
    status_paused: "Pozastaveno",
    unavailable: "Nedostupné",
    unknown: "Neznámé",
    no_device: "Nebyly nalezeny žádné entity AdGuard Home, Pi-hole ani Technitium DNS. Je nainstalována některá z těchto integrací?",
    unknown_device: "DNS filtr nenalezen",
    protection_on: "Zapnout ochranu",
    protection_off: "Vypnout ochranu",
    protection: "Ochrana",
    filtering: "Filtrování",
    parental: "Rodičovská kontrola",
    safe_browsing: "Bezpečné prohlížení",
    safe_search: "Bezpečné vyhledávání",
    query_log: "Protokol dotazů",
    blocking: "Blokování",
    switches: "Nastavení",
    pause: "Pozastavit blokování",
    pause_hint: "Blokování se po zvolené době samo obnoví.",
    resume: "Obnovit blokování",
    indefinitely: "Do obnovení",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Zrušit",
    refresh: "Aktualizovat seznamy filtrů",
    update_available: "Je k dispozici aktualizace",
    version: "Verze",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    open_ui: "Otevřít webové rozhraní",
    open_brand: "Otevřít web {brand}",
    device: "DNS filtr (instance AdGuard Home, Pi-hole nebo Technitium DNS)",
    title: "Název (volitelný, výchozí je název instance)",
    url: "URL webového rozhraní (kliknutí na ikonu záhlaví)",
    url_helper: "Je-li prázdné, automaticky z Home Assistanta (odkaz „Navštívit“ zařízení)",
    show_stats: "Zobrazit dlaždice statistik",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podnázev",
    show_details: "Zobrazit podrobná počítadla",
    show_switches: "Zobrazit přepínače nastavení",
    show_history: "Zobrazit historii za 24 h",
    show_versions: "Zobrazit verze",
    zoom: "Tlačítko přiblížení",
    zoom_helper: "Přepne minikartu na celou kartu a zpět",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    queries: "Poizvedbe DNS",
    blocked: "Blokirano",
    blocked_ratio: "Delež blokiranih",
    avg_speed: "Čas obdelave",
    domains_on_lists: "Domene na seznamih",
    rules: "pravil",
    parental_blocked: "starševski nadzor",
    safe_browsing_blocked: "varno brskanje",
    safe_searches: "varna iskanja",
    clients: "odjemalcev",
    unique_domains: "edinstvenih domen",
    cached: "iz predpomnilnika",
    forwarded: "posredovanih",
    seen_clients: "videnih odjemalcev",
    status_on: "Zaščita vklopljena",
    status_off: "Zaščita izklopljena",
    status_paused: "Začasno ustavljeno",
    unavailable: "Ni na voljo",
    unknown: "Neznano",
    no_device: "Ni najdenih entitet AdGuard Home, Pi-hole ali Technitium DNS. Je nameščena katera od teh integracij?",
    unknown_device: "Filter DNS ni najden",
    protection_on: "Vklopi zaščito",
    protection_off: "Izklopi zaščito",
    protection: "Zaščita",
    filtering: "Filtriranje",
    parental: "Starševski nadzor",
    safe_browsing: "Varno brskanje",
    safe_search: "Varno iskanje",
    query_log: "Dnevnik poizvedb",
    blocking: "Blokiranje",
    switches: "Nastavitve",
    pause: "Začasno ustavi blokiranje",
    pause_hint: "Blokiranje se po izbranem času samodejno nadaljuje.",
    resume: "Nadaljuj blokiranje",
    indefinitely: "Do nadaljevanja",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Prekliči",
    refresh: "Osveži sezname filtrov",
    update_available: "Na voljo je posodobitev",
    version: "Različica",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    open_ui: "Odpri spletni vmesnik",
    open_brand: "Odpri spletno mesto {brand}",
    device: "Filter DNS (primerek AdGuard Home, Pi-hole ali Technitium DNS)",
    title: "Naslov (neobvezno, privzeto ime primerka)",
    url: "URL spletnega vmesnika (klik na ikono v glavi)",
    url_helper: "Če je prazno, samodejno iz Home Assistanta (povezava »Obišči« naprave)",
    show_stats: "Prikaži ploščice s statistiko",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_details: "Prikaži podrobne števce",
    show_switches: "Prikaži stikala nastavitev",
    show_history: "Prikaži 24-urno zgodovino",
    show_versions: "Prikaži različice",
    zoom: "Gumb za povečavo",
    zoom_helper: "Preklopi mini kartico na celotno kartico in nazaj",
    language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    queries: "DNS vaicājumi",
    blocked: "Bloķēti",
    blocked_ratio: "Bloķēto daļa",
    avg_speed: "Apstrādes laiks",
    domains_on_lists: "Domēni sarakstos",
    rules: "noteikumi",
    parental_blocked: "vecāku kontrole",
    safe_browsing_blocked: "droša pārlūkošana",
    safe_searches: "drošas meklēšanas",
    clients: "klienti",
    unique_domains: "unikāli domēni",
    cached: "no kešatmiņas",
    forwarded: "pārsūtīti",
    seen_clients: "redzētie klienti",
    status_on: "Aizsardzība ieslēgta",
    status_off: "Aizsardzība izslēgta",
    status_paused: "Apturēts",
    unavailable: "Nav pieejams",
    unknown: "Nezināms",
    no_device: "Nav atrastas AdGuard Home, Pi-hole vai Technitium DNS entītijas. Vai ir instalēta kāda no šīm integrācijām?",
    unknown_device: "DNS filtrs nav atrasts",
    protection_on: "Ieslēgt aizsardzību",
    protection_off: "Izslēgt aizsardzību",
    protection: "Aizsardzība",
    filtering: "Filtrēšana",
    parental: "Vecāku kontrole",
    safe_browsing: "Droša pārlūkošana",
    safe_search: "Droša meklēšana",
    query_log: "Vaicājumu žurnāls",
    blocking: "Bloķēšana",
    switches: "Iestatījumi",
    pause: "Apturēt bloķēšanu",
    pause_hint: "Bloķēšana pēc izvēlētā laika atsāksies pati.",
    resume: "Atsākt bloķēšanu",
    indefinitely: "Līdz atsākšanai",
    minutes_n: "{n} min",
    hours_n: "{n} h",
    cancel: "Atcelt",
    refresh: "Atsvaidzināt filtru sarakstus",
    update_available: "Pieejams atjauninājums",
    version: "Versija",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    open_ui: "Atvērt tīmekļa saskarni",
    open_brand: "Atvērt {brand} vietni",
    device: "DNS filtrs (AdGuard Home, Pi-hole vai Technitium DNS instance)",
    title: "Nosaukums (neobligāts, pēc noklusējuma instances nosaukums)",
    url: "Tīmekļa saskarnes URL (klikšķis uz galvenes ikonas)",
    url_helper: "Ja tukšs, automātiski no Home Assistant (ierīces saite „Apmeklēt”)",
    show_stats: "Rādīt statistikas flīzes",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_details: "Rādīt detalizētos skaitītājus",
    show_switches: "Rādīt iestatījumu slēdžus",
    show_history: "Rādīt 24 h vēsturi",
    show_versions: "Rādīt versijas",
    zoom: "Tālummaiņas poga",
    zoom_helper: "Pārslēdz mini karti uz pilno karti un atpakaļ",
    language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    queries: "Ερωτήματα DNS",
    blocked: "Αποκλεισμένα",
    blocked_ratio: "Ποσοστό αποκλεισμού",
    avg_speed: "Χρόνος επεξεργασίας",
    domains_on_lists: "Τομείς σε λίστες",
    rules: "κανόνες",
    parental_blocked: "γονικός έλεγχος",
    safe_browsing_blocked: "ασφαλής περιήγηση",
    safe_searches: "ασφαλείς αναζητήσεις",
    clients: "πελάτες",
    unique_domains: "μοναδικοί τομείς",
    cached: "από την κρυφή μνήμη",
    forwarded: "προωθημένα",
    seen_clients: "πελάτες που εντοπίστηκαν",
    status_on: "Προστασία ενεργή",
    status_off: "Προστασία ανενεργή",
    status_paused: "Σε παύση",
    unavailable: "Μη διαθέσιμο",
    unknown: "Άγνωστο",
    no_device: "Δεν βρέθηκαν οντότητες AdGuard Home, Pi-hole ή Technitium DNS. Είναι εγκατεστημένη μία από αυτές τις ενσωματώσεις;",
    unknown_device: "Το φίλτρο DNS δεν βρέθηκε",
    protection_on: "Ενεργοποίηση προστασίας",
    protection_off: "Απενεργοποίηση προστασίας",
    protection: "Προστασία",
    filtering: "Φιλτράρισμα",
    parental: "Γονικός έλεγχος",
    safe_browsing: "Ασφαλής περιήγηση",
    safe_search: "Ασφαλής αναζήτηση",
    query_log: "Αρχείο ερωτημάτων",
    blocking: "Αποκλεισμός",
    switches: "Ρυθμίσεις",
    pause: "Παύση αποκλεισμού",
    pause_hint: "Ο αποκλεισμός συνεχίζεται μόνος του μετά τον επιλεγμένο χρόνο.",
    resume: "Συνέχιση αποκλεισμού",
    indefinitely: "Μέχρι τη συνέχιση",
    minutes_n: "{n} λεπ.",
    hours_n: "{n} ώ.",
    cancel: "Άκυρο",
    refresh: "Ανανέωση λιστών φίλτρων",
    update_available: "Διαθέσιμη ενημέρωση",
    version: "Έκδοση",
    zoom_in: "Εμφάνιση της πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    open_ui: "Άνοιγμα της διεπαφής ιστού",
    open_brand: "Άνοιγμα του ιστότοπου {brand}",
    device: "Φίλτρο DNS (εγκατάσταση AdGuard Home, Pi-hole ή Technitium DNS)",
    title: "Τίτλος (προαιρετικός, από προεπιλογή το όνομα της εγκατάστασης)",
    url: "URL της διεπαφής ιστού (κλικ στο εικονίδιο της κεφαλίδας)",
    url_helper: "Αν είναι κενό, αυτόματα από το Home Assistant (σύνδεσμος «Επίσκεψη» της συσκευής)",
    show_stats: "Εμφάνιση πλακιδίων στατιστικών",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_details: "Εμφάνιση αναλυτικών μετρητών",
    show_switches: "Εμφάνιση διακοπτών ρυθμίσεων",
    show_history: "Εμφάνιση ιστορικού 24 ωρών",
    show_versions: "Εμφάνιση εκδόσεων",
    zoom: "Κουμπί μεγέθυνσης",
    zoom_helper: "Εναλλάσσει τη μίνι κάρτα στην πλήρη κάρτα και αντίστροφα",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: Home Assistant's full locale when its base matches the card's resolved language (keeps the
// region, e.g. pt-BR or de-CH), otherwise the resolved language. Home Assistant's "pt" is European Portuguese,
// which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

const NO_VALUE = new Set(["unavailable", "unknown"]);

// Integer with the locale's thousands separator ("91 654" in French, "91,654" in English).
const fmtInt = (v, loc) => (v === null ? "—" : new Intl.NumberFormat(loc || "en", { maximumFractionDigits: 0 }).format(v));
// Percentage with one decimal under 10 %, none above ("7.4%", "26%").
const fmtPct = (v, loc) =>
  v === null ? "—" : `${new Intl.NumberFormat(loc || "en", { maximumFractionDigits: v < 10 ? 1 : 0 }).format(v)}%`;
// Duration in ms (AdGuard processing speed) with one decimal under 10.
const fmtMs = (v, loc) =>
  v === null ? "—" : `${new Intl.NumberFormat(loc || "en", { maximumFractionDigits: v < 10 ? 1 : 0 }).format(v)} ms`;
// Large counters shortened on the mini card: 2 749 968 → "2.7M", 91 654 → "91.7k".
const fmtShort = (v, loc) => {
  if (v === null) return "—";
  const f = (x, d) => new Intl.NumberFormat(loc || "en", { maximumFractionDigits: d }).format(x);
  if (v >= 1e6) return `${f(v / 1e6, v >= 1e7 ? 0 : 1)}M`;
  if (v >= 1e4) return `${f(v / 1e3, v >= 1e5 ? 0 : 1)}k`;
  return f(v, 0);
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// Only web addresses become links (a configuration_url can also be a homeassistant:// path).
const webUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : null);

const BRAND_NAMES = { adguard: "AdGuard Home", pihole: "Pi-hole", technitium: "Technitium DNS" };
const BRAND_SITES = { adguard: "https://adguard.com/adguard-home/overview.html", pihole: "https://pi-hole.net", technitium: "https://technitium.com/dns/" };
// Brand badge on the header icon: the AdGuard shield in its green, the Pi-hole mark in its red.
const BRAND_BADGES = {
  adguard: `<svg viewBox="0 0 24 24"><path fill="#68bc71" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/><path fill="#fff" d="M10.2,16.4L6.6,12.8L7.9,11.5L10.2,13.8L16.1,7.9L17.4,9.2L10.2,16.4Z"/></svg>`,
  pihole: `<svg viewBox="0 0 24 24"><path fill="#96060c" d="${ICONS.pihole}"/></svg>`,
  // Technitium DNS Server's mark (images/technitium.svg).
  technitium: `<svg viewBox="0 0 512 512"><path fill="#6698fe" d="M512 512H0V0h512zM118.1 85.8v211.7H182V85.7h211.6V22.3H22.3v63.5zm96 96.3h212.1v211.6h63.4V22.2h-63.8v96H214.2c-.1 21.3-.1 42.1-.1 63.9m-191.8-64v371.6H86v-95.8h211.6v-64.1H85.7V118.1zm95.8 371.5h371.5v-63.7h-95.8V214.2h-64.1v212H118.1z"/><path fill="#fefefe" d="M118.1 85.8H22.3V22.3h371.3v63.4H182v211.8h-63.9zm96 96.3v-63.9h211.6v-96h63.8v371.5h-63.4V182.1zm-191.8-64h63.3v211.7h211.9v64.1H85.9v95.8H22.2c.1-123.7.1-247.4.1-371.6m95.8 371.5v-63.4h211.6v-212h64.1v211.7h95.8v63.7z"/></svg>`,
};
// Header icon: the round DNS filter icon of the project page on the showcase site, in the status colour, with the
// brand mark as a badge.
const headerIcon = (cls, brand) =>
  `<span class="logo ${cls}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${ICONS.shield}"/></svg>${
    brand ? `<span class="badge">${BRAND_BADGES[brand]}</span>` : ""
  }</span>`;

// ---------------------------------------------------------------------------
// Entity discovery (entity and device registries)
// ---------------------------------------------------------------------------
//
// Both integrations tag no attribute on their states: their entities are found through the entity registry
// (platform adguard / pi_hole), typed by their language-independent translation_key and grouped per instance
// through the device registry. The Pi-hole blocking switch carries no translation_key: it is the one switch of
// the device.

const PLATFORMS = { adguard: "adguard", pihole: "pi_hole", technitium: "technitiumdns" };

// translation_key → slot. The slots are shared by both brands so the cards render one structure.
const ADGUARD_KEYS = {
  dns_queries: "queries",
  dns_queries_blocked: "blocked",
  dns_queries_blocked_ratio: "ratio",
  average_processing_speed: "speed",
  rules_count: "rules",
  parental_control_blocked: "parental_blocked",
  safe_browsing_blocked: "safe_browsing_blocked",
  safe_searches_enforced: "safe_searches",
  protection: "protection",
  filtering: "filtering",
  parental: "parental",
  safe_browsing: "safe_browsing",
  safe_search: "safe_search",
  query_log: "query_log",
};
const PIHOLE_KEYS = {
  // v6 keys first, then the former (v5) keys of the same counters.
  dns_queries: "queries",
  dns_queries_today: "queries",
  ads_blocked: "blocked",
  ads_blocked_today: "blocked",
  percent_ads_blocked: "ratio",
  ads_percentage_today: "ratio",
  domains_being_blocked: "domains",
  unique_clients: "clients",
  unique_domains: "unique_domains",
  queries_cached: "cached",
  queries_forwarded: "forwarded",
  clients_ever_seen: "seen_clients",
  status: "status",
  core_update_available: "update_core",
  web_update_available: "update_web",
  ftl_update_available: "update_ftl",
};

// Technitium DNS (the technitiumdns integration of the Marketplace) gives no translation keys: its entities have fixed
// English names, hence entity ids ending the same in every language; the blocking switch is the one switch of the
// server, its "Disable Ad Blocking for …" buttons pause it. Its DHCP clients are devices of their own: only the server
// (model "DNS Server") is an instance.
const TECHNITIUM_SUFFIXES = [
  [/_total_queries$/, "queries"],
  [/_blocked_queries$/, "blocked"],
  [/(?<!_top)_clients$/, "clients"],
  [/_total_cached$/, "cached"],
  [/_total_recursive$/, "forwarded"],
  [/_blocked_zones$/, "domains"],
];
const TECHNITIUM_PAUSES = [
  [/_5_minutes$/, 5],
  [/_10_minutes$/, 10],
  [/_30_minutes$/, 30],
  [/_60_minutes$/, 60],
  [/_1_day$/, 1440],
];

// Registry lookups are cached on the registry objects, which Home Assistant replaces whenever an entity or a
// device changes (the states are read again on every render through the mapped ids).
let _registries = { entities: null, devices: null, cache: new Map() };
const registryCache = (hass) => {
  if (_registries.entities !== hass.entities || _registries.devices !== hass.devices)
    _registries = { entities: hass.entities, devices: hass.devices, cache: new Map() };
  return _registries.cache;
};

const naturalOrder = (a, b) => a.localeCompare(b, "en", { numeric: true });

/** The instances of one integration: device id → sorted entity ids. */
const registryRoots = (hass, brand) => {
  const cache = registryCache(hass);
  const key = `roots\n${brand}`;
  if (cache.has(key)) return cache.get(key);
  const byRoot = new Map();
  if (hass.entities && hass.devices) {
    for (const [id, e] of Object.entries(hass.entities)) {
      if (e?.platform !== PLATFORMS[brand] || !e.device_id || !hass.devices[e.device_id]) continue;
      if (brand === "technitium" && hass.devices[e.device_id].model !== "DNS Server") continue;
      if (!byRoot.has(e.device_id)) byRoot.set(e.device_id, []);
      byRoot.get(e.device_id).push(id);
    }
    for (const ids of byRoot.values()) ids.sort(naturalOrder);
  }
  cache.set(key, byRoot);
  return byRoot;
};

const set = (obj, k, id) => {
  if (!(k in obj)) obj[k] = id;
};

/** Map the entities of one AdGuard Home or Pi-hole instance to the structure the cards render. */
const discoverBrand = (hass, brand, deviceId) => {
  const cache = registryCache(hass);
  const key = `${brand}\n${deviceId || ""}`;
  if (cache.has(key)) return cache.get(key);
  const byRoot = registryRoots(hass, brand);
  const rootId = deviceId ? (byRoot.has(deviceId) ? deviceId : null) : ([...byRoot.keys()].sort()[0] ?? null);
  const dev = { brand, deviceId: rootId, e: {}, info: null };
  if (rootId) {
    const d = hass.devices[rootId];
    dev.info = { name: d.name_by_user || d.name, version: d.sw_version, url: d.configuration_url };
    const KEYS = brand === "adguard" ? ADGUARD_KEYS : PIHOLE_KEYS;
    if (brand === "technitium") {
      dev.pauses = {};
      for (const id of byRoot.get(rootId)) {
        const domain = id.split(".")[0];
        if (domain === "switch") set(dev.e, "protection", id);
        else if (domain === "button") {
          const pause = TECHNITIUM_PAUSES.find(([re]) => re.test(id));
          if (pause) dev.pauses[pause[1]] ??= id;
        } else if (domain === "sensor") {
          const slot = TECHNITIUM_SUFFIXES.find(([re]) => re.test(id));
          if (slot) set(dev.e, slot[1], id);
        }
      }
      cache.set(key, dev);
      return dev;
    }
    for (const id of byRoot.get(rootId)) {
      const tk = hass.entities[id].translation_key;
      const domain = id.split(".")[0];
      if (tk in KEYS && (domain === "sensor" || domain === "switch" || domain === "binary_sensor" || domain === "update")) {
        set(dev.e, KEYS[tk], id);
      } else if (domain === "switch" && brand === "pihole") {
        set(dev.e, "protection", id); // The Pi-hole blocking switch has no translation_key.
      } else if (domain === "update" && brand === "adguard") {
        set(dev.e, "update_core", id); // The AdGuard Home update entity has no translation_key.
      }
    }
  }
  cache.set(key, dev);
  return dev;
};

/** The configured instance, whatever its integration, else the first one found (AdGuard Home first). */
const discover = (hass, deviceId) => {
  let first = null;
  for (const brand of Object.keys(PLATFORMS)) {
    const dev = discoverBrand(hass, brand, deviceId);
    if (dev.deviceId) return dev;
    first ??= dev;
  }
  return first;
};

// The `entities` option: sensors and switches of the user's choice for the card's slots (queries, blocked, ratio,
// protection…), replacing the ones found. One result per instance and option, a stable object while neither changes.
const ENTITY_SLOTS = ["queries", "blocked", "ratio", "speed", "domains", "clients", "unique_domains", "cached", "forwarded", "protection", "status"];
const isEntityId = (v) => typeof v === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(v);
const withEntitiesCache = new WeakMap();
const withEntities = (dev, entities) => {
  if (!dev || !entities || typeof entities !== "object") return dev;
  const own = ENTITY_SLOTS.filter((k) => isEntityId(entities[k]));
  if (!own.length) return dev;
  const key = own.map((k) => `${k}=${entities[k]}`).join(",");
  const hit = withEntitiesCache.get(dev);
  if (hit?.key === key) return hit.result;
  const result = { ...dev, e: { ...dev.e, ...Object.fromEntries(own.map((k) => [k, entities[k]])) } };
  withEntitiesCache.set(dev, { key, result });
  return result;
};

/** All instances, for the editor: { value: device id, label: "Brand · name" }. */
const listDevices = (hass) =>
  Object.keys(PLATFORMS).flatMap((brand) =>
    [...registryRoots(hass, brand).keys()].sort().map((id) => {
      const d = hass.devices[id];
      return { value: id, label: `${BRAND_NAMES[brand]} · ${d.name_by_user || d.name || id}` };
    })
  );

// Protection state of an instance: AdGuard's protection switch, Pi-hole's status binary sensor (on = blocking)
// or, failing it, its switch. { state: "on" | "off" | "unavailable" | "unknown", id }.
const protectionOf = (hass, dev) => {
  const id = dev.brand === "pihole" ? dev.e.status || dev.e.protection : dev.e.protection;
  const s = id && hass.states[id];
  if (!s) return null;
  return { id, state: NO_VALUE.has(s.state) ? s.state : s.state === "on" ? "on" : "off" };
};

// Versions shown in the footer: Pi-hole's three update entities carry the installed versions of Core, FTL and the
// web interface; AdGuard Home's update entity and the device carry the AdGuard Home version.
const versionsOf = (hass, dev) => {
  const parts = [];
  const push = (label, id) => {
    const s = id && hass.states[id];
    const v = s?.attributes?.installed_version;
    if (v) parts.push({ label, version: String(v), id, update: s.state === "on" ? String(s.attributes.latest_version || "") : null });
  };
  if (dev.brand === "pihole") {
    push("Core", dev.e.update_core);
    push("FTL", dev.e.update_ftl);
    push("Web", dev.e.update_web);
  } else push("AdGuard Home", dev.e.update_core);
  if (!parts.length && dev.info?.version) parts.push({ label: BRAND_NAMES[dev.brand], version: String(dev.info.version), id: null, update: null });
  return parts;
};

// ---------------------------------------------------------------------------
// DOM patching
// ---------------------------------------------------------------------------

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard focus, hover
// and CSS transitions survive an update, and only the changed text and attributes are written. Nodes with a
// data-key are matched by it wherever they moved; the others by position.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};

// ---------------------------------------------------------------------------
// History (recorder statistics)
// ---------------------------------------------------------------------------

// Sparkline of a 24 h series: points placed by their time over the last 24 hours, scaled from 0 to the series'
// peak; the line breaks where points are more than two periods apart. Nothing under two points.
const HIST_REFRESH = 5 * 60000;
const HIST_PERIOD = 5 * 60000;
const HIST_WINDOW = 864e5;
function spark(points, now = Date.now()) {
  if (!points || points.length < 2) return "";
  const peak = Math.max(...points.map((p) => p.v)) || 1;
  const from = now - HIST_WINDOW;
  const x = (t) => Math.max(0, Math.min(100, ((t - from) / HIST_WINDOW) * 100)).toFixed(2);
  const y = (v) => (30 - (Math.min(Math.max(0, v), peak) / peak) * 28).toFixed(2);
  const runs = [[points[0]]];
  for (let i = 1; i < points.length; i++) {
    if (points[i].t - points[i - 1].t > 2 * HIST_PERIOD) runs.push([]);
    runs.at(-1).push(points[i]);
  }
  const segs = runs.filter((r) => r.length > 1);
  if (!segs.length) return "";
  const line = (r) => r.map((p) => `${x(p.t)},${y(p.v)}`).join("L");
  const area = segs.map((r) => `M${x(r[0].t)},30L${line(r)}L${x(r.at(-1).t)},30Z`).join("");
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="spark-a" d="${area}"/><path class="spark-l" d="${segs
    .map((r) => `M${line(r)}`)
    .join("")}"/></svg>`;
}

// Points of a recorder statistics series: { t, v }, t at the end of the 5-minute period, without the periods
// that have no mean.
const histPoints = (rows) =>
  (rows || [])
    .map((p) => ({ t: (typeof p.start === "number" ? p.start : Date.parse(p.start)) + HIST_PERIOD, v: p.mean }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v));

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --dnsf-accent: #4f7fd9; --dnsf-ok: var(--success-color, #43a047); --dnsf-warn: var(--warning-color, #ffa600);
          --dnsf-crit: var(--error-color, #db4437); --dnsf-na: var(--disabled-text-color, #9e9e9e); --dnsf-info: var(--info-color, #039be5); }
  ha-card { overflow: hidden; position: relative; container-type: inline-size; }
  /* A size container has no width of its own content: in a parent that sizes to its content (inline-block, grid auto
     column) the card would fall to a few pixels. This empty, zero-height grid gives it a natural (max-content) width
     of 400 px without any minimum, so it still shrinks to a narrow column. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 400px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--dnsf-ok); } .warn { --c: var(--dnsf-warn); } .crit { --c: var(--dnsf-crit); } .na { --c: var(--dnsf-na); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--dnsf-ok)); flex: none; display: inline-block; }
  /* The state color stays on the dot and the tint; the text mixes it with the text color to stay readable. */
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--dnsf-ok)) 15%, transparent);
          color: color-mix(in srgb, var(--c, var(--dnsf-ok)) 40%, var(--primary-text-color, #212121)); }
  .chip .txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* The status pill sits right of the title, centred on the title line; the subtitle keeps the title's width. */
  .titles { flex: 1 1 0; min-width: 0; display: grid; grid-template-columns: minmax(48px, 1fr) auto; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .titles > .name, .titles > .sub { grid-column: 1; }
  .titles > .chip { grid-area: 1 / 2; align-self: center; margin-left: 10px; white-space: nowrap; min-width: 0; max-width: 100%;
                    overflow: hidden; box-sizing: border-box; }
  @container (max-width: 200px) { .chip .txt { display: none; } }
  .logo { height: 40px; width: 40px; flex: none; align-self: flex-start; border-radius: 50%; display: grid; place-items: center;
          position: relative; color: var(--c, var(--dnsf-ok)); background: color-mix(in srgb, var(--c, var(--dnsf-ok)) 16%, transparent); }
  .logo svg { width: 24px; height: 24px; fill: currentColor; }
  .logo .badge { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 5px; padding: 2px; box-sizing: border-box;
                 display: grid; place-items: center; background: #fff;
                 box-shadow: 0 0 0 1px var(--divider-color, rgba(0,0,0,.12)), 0 0 0 3px var(--card-background-color, #fff); }
  .logo .badge svg { width: 100%; height: 100%; }
  .brand-link { display: flex; flex: none; border-radius: 50%; align-self: flex-start; }
  .brand-link:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 4ch; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--dnsf-warn) 40%, var(--primary-text-color, #212121)); }
  .zoom, .action { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center;
                   color: var(--secondary-text-color); }
  .zoom { margin: -4px -4px -4px 0; }
  .zoom .icon, .action .icon { width: 16px; height: 16px; }
  .zoom:hover, .action:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible, .action:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .action:disabled { cursor: default; opacity: .4; }
  .action:disabled:hover { background: none; color: var(--secondary-text-color); }
  .spark-a { fill: color-mix(in srgb, var(--c) 12%, transparent); }
  .spark-l { fill: none; stroke: color-mix(in srgb, var(--c) 50%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
  .upd { --c: var(--dnsf-accent); }
  .chip.upd .icon { width: 14px; height: 14px; color: inherit; }
`;

// In-card popup (pause durations), at the top of the card so it stays in view when the card is long.
const DIALOG_STYLE = `
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           overflow: auto; box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4);
           display: flex; flex-direction: column; gap: 10px; }
  .modal h3 { margin: 0; font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .modal h3 .icon { width: 20px; height: 20px; color: var(--dnsf-warn); }
  .modal .hint { font-size: 13px; color: var(--secondary-text-color); line-height: 1.4; }
  .durations { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .modal button.act { border: 0; border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                      background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal button.act:hover { background: color-mix(in srgb, var(--dnsf-warn) 20%, var(--secondary-background-color, transparent)); }
  .modal button.act:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .modal-actions { display: flex; justify-content: flex-end; margin-top: 2px; }
`;
const CONFIRM_GUARD_MS = 400;
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));
const isOutside = (card, ev) => !ev.composedPath().includes(card) && !inDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event. `tap(ev)` (press and release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// Pause durations offered for Pi-hole (minutes); 0 = until resumed by hand.
const PAUSE_MINUTES = [5, 15, 30, 60, 120, 0];
const hms = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

// ---------------------------------------------------------------------------
// Base card
// ---------------------------------------------------------------------------

class DnsFilterBase extends HTMLElement {
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
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._dialogOutside.off();
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
    return `
      <div class="header">
        <a class="brand-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(title)}">${headerIcon(status?.cls ?? "na", dev.brand)}</a>
        <div class="titles">
          <div class="name">${esc(name)}</div>
          <div class="sub">${esc(sub)}</div>
          ${
            status
              ? `<span class="chip clickable ${status.cls}" role="button" tabindex="0" data-action="protection" title="${esc(this._statusAction(dev, status))}" aria-label="${esc(
                  status.text
                )}"><span class="dot"></span><span class="txt">${esc(status.text)}</span></span>`
              : ""
          }
        </div>
        ${this._zoomButton()}
      </div>${this._dialogHtml()}`;
  }

  _compactHeader() {
    return false;
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

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const FULL_STYLE = `
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
  @container (max-width: 240px) { .stats { grid-template-columns: minmax(0, 1fr); } }
`;

class DnsFilterCard extends DnsFilterBase {
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
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
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

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  /* The status shows in the footer. */
  .titles > .chip { display: none; }
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
  .foot > [data-key="status"] { flex: 0 1 auto; min-width: 0; overflow: hidden; }
  .foot .txt { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .foot .icon { width: 14px; height: 14px; }
  .foot > .upd { flex: 0 1 auto; min-width: 0; overflow: hidden; color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color, #212121)); font-weight: 500; }
  /* Narrow mini card (6 columns on a phone): one statistic per line. */
  @container (max-width: 240px) { .mini-stats { grid-template-columns: minmax(0, 1fr); } .ms { flex-direction: row; align-items: center; justify-content: space-between; } }
`;

// The mini card extends the full card: its zoom button (top right, `zoom: false` removes it) switches it to the full
// card's content, same configuration, and back; a click anywhere outside the card brings it back too.
class DnsFilterMiniCard extends DnsFilterCard {
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
    return `<button class="zoom" title="${esc(this._t(z ? "zoom_out" : "zoom_in"))}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
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
    const foot = [];
    const status = this._status(dev);
    if (status)
      foot.push(
        `<span class="clickable ${status.cls}" role="button" tabindex="0" data-key="status" data-action="protection" title="${esc(this._statusAction(dev, status))}" aria-label="${esc(
          status.text
        )}"><span class="dot"></span>&nbsp;<span class="txt">${esc(status.text)}</span></span>`
      );
    for (const u of this._updates(dev))
      foot.push(
        `<span class="clickable upd" role="button" tabindex="0" data-key="upd-${u.id}" data-entity="${u.id}" title="${esc(u.text)}" aria-label="${esc(u.text)}">${svgIcon(
          ICONS.update
        )}<span class="txt">${esc(u.short)}</span></span>`
      );
    const pct = ratio?.value;
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
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

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class DnsFilterEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
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
          if (v === "" || v === undefined || v === null || (this.constructor.toggles.includes(k) && v === true)) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const name of this.constructor.toggles) if (data[name] === undefined) data[name] = true;
    // Without device (hand-written YAML), show the instance the card shows: saving the form then keeps it.
    if (!data.device && this._hass) data.device = discover(this._hass, "").deviceId || undefined;
    // Schema before data: the device combo box resolves its label from the options, so they must be
    // there when the value lands (else it shows the raw device id).
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = data;
  }
}

class DnsFilterCardEditor extends DnsFilterEditorBase {
  static get toggles() {
    return ["show_title", "show_subtitle", "show_stats", "show_details", "show_switches", "show_history", "show_versions"];
  }
}

class DnsFilterMiniCardEditor extends DnsFilterEditorBase {
  static get toggles() {
    return ["show_history", "zoom"];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
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
    description: "AdGuard Home or Pi-hole at a glance: queries, blocked, ratio, settings switches, pause, versions.",
  },
  {
    type: "dns-filter-mini-card",
    name: "DNS Filter Mini Card",
    description: "Compact AdGuard Home or Pi-hole overview: queries, blocked, blocked ratio and protection status.",
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
