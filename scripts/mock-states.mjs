// Mock Home Assistant states, entity registry and device registry shaped like the AdGuard Home and Pi-hole
// integrations, used to render the README screenshots and by the tests. Neutral data, no personal names.

const registryMock = (platform, device, entries) => {
  const mock = { states: {}, entities: {}, devices: {} };
  mock.devices[device.id] = device;
  for (const [id, tk, state, attributes = {}] of entries) {
    mock.states[id] = { entity_id: id, state: String(state), attributes: { friendly_name: `${device.name} ${attributes.name || tk}`, ...attributes } };
    delete mock.states[id].attributes.name;
    mock.entities[id] = { entity_id: id, platform, device_id: device.id, translation_key: tk };
  }
  return mock;
};

// AdGuard Home: the sensors (units from the integration), the six setting switches and the update entity.
export const adguard = registryMock(
  "adguard",
  { id: "adguard_home_1", name: "AdGuard Home", sw_version: "v0.107.63", configuration_url: "http://192.168.1.2:3000" },
  [
    ["sensor.adguard_home_dns_queries", "dns_queries", 91654, { unit_of_measurement: "queries", name: "DNS queries" }],
    ["sensor.adguard_home_dns_queries_blocked", "dns_queries_blocked", 23901, { unit_of_measurement: "queries", name: "DNS queries blocked" }],
    ["sensor.adguard_home_dns_queries_blocked_ratio", "dns_queries_blocked_ratio", 26.08, { unit_of_measurement: "%", name: "DNS queries blocked ratio" }],
    ["sensor.adguard_home_parental_control_blocked", "parental_control_blocked", 312, { unit_of_measurement: "requests", name: "Parental control blocked" }],
    ["sensor.adguard_home_safe_browsing_blocked", "safe_browsing_blocked", 47, { unit_of_measurement: "requests", name: "Safe browsing blocked" }],
    ["sensor.adguard_home_safe_searches_enforced", "safe_searches_enforced", 1208, { unit_of_measurement: "requests", name: "Safe searches enforced" }],
    ["sensor.adguard_home_average_processing_speed", "average_processing_speed", 7.4, { unit_of_measurement: "ms", device_class: "duration", name: "Average processing speed" }],
    ["sensor.adguard_home_rules_count", "rules_count", 184236, { unit_of_measurement: "rules", name: "Rules count" }],
    ["switch.adguard_home_protection", "protection", "on", { name: "Protection" }],
    ["switch.adguard_home_filtering", "filtering", "on", { name: "Filtering" }],
    ["switch.adguard_home_parental_control", "parental", "off", { name: "Parental control" }],
    ["switch.adguard_home_safe_browsing", "safe_browsing", "on", { name: "Safe browsing" }],
    ["switch.adguard_home_safe_search", "safe_search", "off", { name: "Safe search" }],
    ["switch.adguard_home_query_log", "query_log", "on", { name: "Query log" }],
    [
      "update.adguard_home_update",
      undefined,
      "on",
      { installed_version: "v0.107.63", latest_version: "v0.107.64", title: "AdGuard Home", name: "Update" },
    ],
  ]
);

// Pi-hole v6: the counters, the status binary sensor, the blocking switch (no translation_key) and the three
// update entities with their installed versions.
export const pihole = registryMock(
  "pi_hole",
  { id: "pi_hole_1", name: "Pi-hole", sw_version: "6.0.6", configuration_url: "http://192.168.1.3/admin" },
  [
    ["sensor.pi_hole_dns_queries", "dns_queries", 101165, { unit_of_measurement: "queries", name: "DNS queries" }],
    ["sensor.pi_hole_ads_blocked", "ads_blocked", 24020, { unit_of_measurement: "ads", name: "Ads blocked" }],
    ["sensor.pi_hole_ads_percentage_blocked", "percent_ads_blocked", 23.74, { unit_of_measurement: "%", name: "Ads percentage blocked" }],
    ["sensor.pi_hole_domains_blocked", "domains_being_blocked", 2749968, { unit_of_measurement: "domains", name: "Domains blocked" }],
    ["sensor.pi_hole_dns_unique_clients", "unique_clients", 29, { unit_of_measurement: "clients", name: "DNS unique clients" }],
    ["sensor.pi_hole_dns_unique_domains", "unique_domains", 17952, { unit_of_measurement: "domains", name: "DNS unique domains" }],
    ["sensor.pi_hole_dns_queries_cached", "queries_cached", 52022, { unit_of_measurement: "queries", name: "DNS queries cached" }],
    ["sensor.pi_hole_dns_queries_forwarded", "queries_forwarded", 15089, { unit_of_measurement: "queries", name: "DNS queries forwarded" }],
    ["sensor.pi_hole_seen_clients", "clients_ever_seen", 71, { unit_of_measurement: "clients", name: "Seen clients" }],
    ["binary_sensor.pi_hole_status", "status", "on", { name: "Status" }],
    ["switch.pi_hole", undefined, "on", { icon: "mdi:pi-hole", name: "" }],
    ["update.pi_hole_core_update_available", "core_update_available", "off", { installed_version: "6.0.6", latest_version: "6.0.6", name: "Core update available" }],
    ["update.pi_hole_ftl_update_available", "ftl_update_available", "on", { installed_version: "6.1", latest_version: "6.2.1", name: "FTL update available" }],
    ["update.pi_hole_web_update_available", "web_update_available", "off", { installed_version: "6.1", latest_version: "6.1", name: "Web update available" }],
  ]
);
pihole.states["switch.pi_hole"].attributes.friendly_name = "Pi-hole";

export const mocks = { adguard, pihole };
