// ---------------------------------------------------------------------------
// Entity discovery (entity and device registries)
// ---------------------------------------------------------------------------
//
// Both integrations tag no attribute on their states: their entities are found through the entity registry
// (platform adguard / pi_hole), typed by their language-independent translation_key and grouped per instance
// through the device registry. The Pi-hole blocking switch carries no translation_key: it is the one switch of
// the device.
import { BRAND_NAMES, NO_VALUE } from "./helpers.js";

export const PLATFORMS = { adguard: "adguard", pihole: "pi_hole", technitium: "technitiumdns" };

// translation_key → slot. The slots are shared by both brands so the cards render one structure.
export const ADGUARD_KEYS = {
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
export const PIHOLE_KEYS = {
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
// is an instance — the device of model "DNS Server", or, should the integration rename that model, the device that
// carries the total queries sensor (a DHCP client has none).
export const TECHNITIUM_SUFFIXES = [
  [/_total_queries$/, "queries"],
  [/_blocked_queries$/, "blocked"],
  [/(?<!_top)_clients$/, "clients"],
  [/_total_cached$/, "cached"],
  [/_total_recursive$/, "forwarded"],
  [/_blocked_zones$/, "domains"],
];
export const TECHNITIUM_PAUSES = [
  [/_5_minutes$/, 5],
  [/_10_minutes$/, 10],
  [/_30_minutes$/, 30],
  [/_60_minutes$/, 60],
  [/_1_day$/, 1440],
];

// Registry lookups are cached on the registry objects, which Home Assistant replaces whenever an entity or a
// device changes (the states are read again on every render through the mapped ids).
export let _registries = { entities: null, devices: null, cache: new Map() };
export const registryCache = (hass) => {
  if (_registries.entities !== hass.entities || _registries.devices !== hass.devices)
    _registries = { entities: hass.entities, devices: hass.devices, cache: new Map() };
  return _registries.cache;
};

export const naturalOrder = (a, b) => a.localeCompare(b, "en", { numeric: true });

/** The instances of one integration: device id → sorted entity ids. */
export const registryRoots = (hass, brand) => {
  const cache = registryCache(hass);
  const key = `roots\n${brand}`;
  if (cache.has(key)) return cache.get(key);
  const byRoot = new Map();
  if (hass.entities && hass.devices) {
    for (const [id, e] of Object.entries(hass.entities)) {
      if (e?.platform !== PLATFORMS[brand] || !e.device_id || !hass.devices[e.device_id]) continue;
      if (!byRoot.has(e.device_id)) byRoot.set(e.device_id, []);
      byRoot.get(e.device_id).push(id);
    }
    if (brand === "technitium")
      for (const [deviceId, ids] of byRoot)
        if (hass.devices[deviceId].model !== "DNS Server" && !ids.some((id) => id.startsWith("sensor.") && /_total_queries$/.test(id))) byRoot.delete(deviceId);
    for (const ids of byRoot.values()) ids.sort(naturalOrder);
  }
  cache.set(key, byRoot);
  return byRoot;
};

export const set = (obj, k, id) => {
  if (!(k in obj)) obj[k] = id;
};

/** Map the entities of one AdGuard Home or Pi-hole instance to the structure the cards render. */
export const discoverBrand = (hass, brand, deviceId) => {
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
export const discover = (hass, deviceId) => {
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
export const ENTITY_SLOTS = ["queries", "blocked", "ratio", "speed", "domains", "clients", "unique_domains", "cached", "forwarded", "protection", "status"];
export const isEntityId = (v) => typeof v === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(v);
export const withEntitiesCache = new WeakMap();
export const withEntities = (dev, entities) => {
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
export const listDevices = (hass) =>
  Object.keys(PLATFORMS).flatMap((brand) =>
    [...registryRoots(hass, brand).keys()].sort().map((id) => {
      const d = hass.devices[id];
      return { value: id, label: `${BRAND_NAMES[brand]} · ${d.name_by_user || d.name || id}` };
    })
  );

// Protection state of an instance: AdGuard's protection switch, Pi-hole's status binary sensor (on = blocking)
// or, failing it, its switch. { state: "on" | "off" | "unavailable" | "unknown", id }.
export const protectionOf = (hass, dev) => {
  const id = dev.brand === "pihole" ? dev.e.status || dev.e.protection : dev.e.protection;
  const s = id && hass.states[id];
  if (!s) return null;
  return { id, state: NO_VALUE.has(s.state) ? s.state : s.state === "on" ? "on" : "off" };
};

// Versions shown in the footer: Pi-hole's three update entities carry the installed versions of Core, FTL and the
// web interface; AdGuard Home's update entity and the device carry the AdGuard Home version.
export const versionsOf = (hass, dev) => {
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
