// ---------------------------------------------------------------------------
// History (recorder statistics)
// ---------------------------------------------------------------------------

// Sparkline of a 24 h series: points placed by their time over the last 24 hours, scaled from 0 to the series'
// peak; the line breaks where points are more than two periods apart. Nothing under two points.
export const HIST_REFRESH = 5 * 60000;
export const HIST_PERIOD = 5 * 60000;
export const HIST_WINDOW = 864e5;
export function spark(points, now = Date.now()) {
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
export const histPoints = (rows) =>
  (rows || [])
    .map((p) => ({ t: (typeof p.start === "number" ? p.start : Date.parse(p.start)) + HIST_PERIOD, v: p.mean }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v));
