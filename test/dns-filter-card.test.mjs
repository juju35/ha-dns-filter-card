import assert from "node:assert/strict";
import { test } from "node:test";

// Objects built inside the card's vm context are not reference-equal to ours: compare their JSON.
const eq = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), b, msg);
import { load } from "./load.mjs";
import { adguard, pihole } from "../scripts/mock-states.mjs";

const { discover, listDevices, protectionOf, versionsOf, fmtShort, fmtPct, hms, DnsFilterCard, DnsFilterMiniCard, STRINGS, spark, histPoints } = load(
  "dns-filter-card.js",
  ["discover", "listDevices", "protectionOf", "versionsOf", "fmtShort", "fmtPct", "hms", "DnsFilterCard", "DnsFilterMiniCard", "STRINGS", "spark", "histPoints"]
);

const hassOf = (...mocks) => {
  const h = { states: {}, entities: {}, devices: {}, language: "en" };
  for (const m of mocks) {
    Object.assign(h.states, m.states);
    Object.assign(h.entities, m.entities);
    Object.assign(h.devices, m.devices);
  }
  return h;
};

test("AdGuard Home entities are mapped by translation_key", () => {
  const dev = discover(hassOf(adguard), "");
  assert.equal(dev.brand, "adguard");
  assert.equal(dev.deviceId, "adguard_home_1");
  assert.equal(dev.e.queries, "sensor.adguard_home_dns_queries");
  assert.equal(dev.e.ratio, "sensor.adguard_home_dns_queries_blocked_ratio");
  assert.equal(dev.e.protection, "switch.adguard_home_protection");
  assert.equal(dev.e.query_log, "switch.adguard_home_query_log");
  assert.equal(dev.e.update_core, "update.adguard_home_update");
});

test("Pi-hole entities are mapped, the blocking switch without translation_key", () => {
  const dev = discover(hassOf(pihole), "");
  assert.equal(dev.brand, "pihole");
  assert.equal(dev.e.queries, "sensor.pi_hole_dns_queries");
  assert.equal(dev.e.domains, "sensor.pi_hole_domains_blocked");
  assert.equal(dev.e.status, "binary_sensor.pi_hole_status");
  assert.equal(dev.e.protection, "switch.pi_hole");
  assert.equal(dev.e.update_ftl, "update.pi_hole_ftl_update_available");
});

test("the configured device picks its integration; both instances are listed for the editor", () => {
  const hass = hassOf(adguard, pihole);
  assert.equal(discover(hass, "pi_hole_1").brand, "pihole");
  assert.equal(discover(hass, "adguard_home_1").brand, "adguard");
  assert.equal(discover(hass, "").brand, "adguard");
  assert.equal(discover(hass, "nope").deviceId, null);
  eq(
    listDevices(hass).map((o) => o.label),
    ["AdGuard Home · AdGuard Home", "Pi-hole · Pi-hole"]
  );
});

test("protection state: AdGuard switch, Pi-hole status binary sensor", () => {
  const ha = hassOf(adguard, pihole);
  eq(protectionOf(ha, discover(ha, "adguard_home_1")), { id: "switch.adguard_home_protection", state: "on" });
  ha.states["binary_sensor.pi_hole_status"] = { ...ha.states["binary_sensor.pi_hole_status"], state: "off" };
  eq(protectionOf(ha, discover(ha, "pi_hole_1")), { id: "binary_sensor.pi_hole_status", state: "off" });
  ha.states["binary_sensor.pi_hole_status"] = { ...ha.states["binary_sensor.pi_hole_status"], state: "unavailable" };
  assert.equal(protectionOf(ha, discover(ha, "pi_hole_1")).state, "unavailable");
});

test("versions come from the update entities, with the pending update", () => {
  const ha = hassOf(pihole);
  const v = versionsOf(ha, discover(ha, ""));
  eq(
    v.map((x) => [x.label, x.version, x.update]),
    [
      ["Core", "6.0.6", null],
      ["FTL", "6.1", "6.2.1"],
      ["Web", "6.1", null],
    ]
  );
  // Without update entities, the device's software version.
  const h2 = hassOf(adguard);
  delete h2.states["update.adguard_home_update"];
  eq(versionsOf(h2, discover(h2, "")), [{ label: "AdGuard Home", version: "v0.107.63", id: null, update: null }]);
});

test("number formats", () => {
  assert.equal(fmtShort(2749968, "en"), "2.7M");
  assert.equal(fmtShort(91654, "en"), "91.7k");
  assert.equal(fmtShort(101165, "en"), "101k");
  assert.equal(fmtShort(312, "en"), "312");
  assert.equal(fmtShort(null, "en"), "—");
  assert.equal(fmtPct(26.08, "en"), "26%");
  assert.equal(fmtPct(7.44, "fr"), "7,4%");
  assert.equal(hms(5), "00:05:00");
  assert.equal(hms(120), "02:00:00");
});

test("full card renders the four tiles, the switches and the update chip", () => {
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = hassOf(adguard);
  const html = el._render();
  assert.match(html, /DNS queries/);
  assert.match(html, />91,654</);
  assert.match(html, /Processing time/);
  assert.match(html, />7\.4 ms</);
  assert.match(html, /data-action="toggle" data-entity="switch\.adguard_home_parental_control" aria-pressed="false"/);
  assert.match(html, /Update available · AdGuard Home v0\.107\.64/);
  assert.match(html, /data-action="refresh"/);
  assert.doesNotMatch(html, /data-action="pause"/);
});

test("Pi-hole full card shows the domains tile, the pause button and the three versions", () => {
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = hassOf(pihole);
  const html = el._render();
  assert.match(html, /Domains on lists/);
  assert.match(html, />2,749,968</);
  assert.match(html, /data-action="pause"/);
  assert.match(html, /Core <b>6\.0\.6<\/b>/);
  assert.doesNotMatch(html, /data-action="refresh"/);
  // Blocking paused: the resume button and the paused pill.
  el._hass.states["binary_sensor.pi_hole_status"] = { ...el._hass.states["binary_sensor.pi_hole_status"], state: "off" };
  el._hass.states["switch.pi_hole"] = { ...el._hass.states["switch.pi_hole"], state: "off" };
  const paused = el._render();
  assert.match(paused, /data-action="resume"/);
  assert.match(paused, /Paused/);
});

test("mini card: three short tiles, the ratio bar and the status in the footer", () => {
  const el = new DnsFilterMiniCard();
  el._config = {};
  el._hass = hassOf(pihole);
  const html = el._render();
  assert.match(html, />101k</);
  assert.match(html, />24k</);
  assert.match(html, /width:23\.74%/);
  assert.match(html, /data-key="status"[^>]*>.*Protection on/);
  assert.doesNotMatch(html, /Domains on lists/);
  // Zoomed: the full card's content.
  el._zoomed = true;
  assert.match(el._render(), /Domains on lists/);
});

test("without any instance the card shows a setup warning, a wrong device its id", () => {
  const el = new DnsFilterCard();
  el._hass = { states: {}, entities: {}, devices: {}, language: "en" };
  el._config = {};
  assert.match(el._render(), /No AdGuard Home or Pi-hole entities found/);
  el._config = { device: "abc" };
  assert.match(el._render(), /DNS filter not found: abc/);
});

test("pause services: a duration goes through pi_hole.disable, « until resumed » through the switch", () => {
  const calls = [];
  const el = new DnsFilterCard();
  el._config = {};
  el._hass = { ...hassOf(pihole), callService: (d, s, data) => calls.push([d, s, data]) };
  el._pause(30);
  el._pause(0);
  el._resume();
  return new Promise((r) => setTimeout(r, 0)).then(() =>
    eq(calls, [
      ["pi_hole", "disable", { entity_id: "switch.pi_hole", duration: "00:30:00" }],
      ["switch", "turn_off", { entity_id: "switch.pi_hole" }],
      ["switch", "turn_on", { entity_id: "switch.pi_hole" }],
    ])
  );
});

test("the render is skipped while nothing shown has changed", () => {
  const el = new DnsFilterCard();
  el.setConfig({});
  let renders = 0;
  el._update = (sig) => {
    renders++;
    el._sig = sig ?? el._signature();
  };
  const h1 = hassOf(adguard);
  el.hass = h1;
  el.hass = { ...h1 }; // same states and registries
  assert.equal(renders, 1);
  el.hass = { ...h1, states: { ...h1.states, "sensor.adguard_home_dns_queries": { ...h1.states["sensor.adguard_home_dns_queries"], state: "1" } } };
  assert.equal(renders, 2);
});

test("sparkline follows the time axis and breaks on gaps", () => {
  const now = 1_700_000_000_000;
  const period = 5 * 60000;
  const pts = histPoints([
    { start: now - 3 * period, mean: 1 },
    { start: now - 2 * period, mean: 2 },
    { start: now - 20 * period, mean: 3 },
  ]);
  assert.equal(pts.length, 3);
  assert.equal(spark([pts[0]], now), "");
  const svg = spark([pts[2], pts[0], pts[1]], now);
  assert.match(svg, /class="spark-l" d="M[^"]*"/);
  assert.equal((svg.match(/d="M/g) || []).length, 2); // one area path, one line path
});

test("every language carries every English string", () => {
  const keys = Object.keys(STRINGS.en);
  for (const [l, s] of Object.entries(STRINGS)) {
    assert.deepEqual(Object.keys(s).sort(), [...keys].sort(), `${l} strings`);
    for (const k of keys) assert.ok(String(s[k]).trim(), `${l}.${k} is empty`);
  }
  assert.equal(Object.keys(STRINGS).length, 22);
});
