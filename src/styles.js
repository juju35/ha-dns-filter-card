// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --dnsf-accent: #4f7fd9; --dnsf-ok: var(--success-color, #43a047); --dnsf-warn: var(--warning-color, #ffa600);
          --dnsf-crit: var(--error-color, #db4437); --dnsf-na: var(--disabled-text-color, #9e9e9e); --dnsf-info: var(--info-color, #039be5); }
  ha-card { overflow: hidden; position: relative; container: dnsf-card / inline-size; }
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
  /* The status pill sits right after the title, centred on the title line; the subtitle takes the whole width. */
  .titles { flex: 1 1 0; min-width: 0; display: grid; grid-template-columns: minmax(0, max-content) minmax(0, 1fr); }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .titles > .name { grid-column: 1; } .titles > .sub { grid-column: 1 / -1; }
  .titles > .chip { grid-area: 1 / 2; align-self: center; justify-self: start; margin-left: 8px; white-space: nowrap; min-width: 0; max-width: 100%;
                    overflow: hidden; box-sizing: border-box; }
  /* Not enough room beside the whole title (measured, see _fitPill): the pill goes on its own line, under the
     subtitle; only its dot when even that is too tight, or at 200 px or less. */
  .titles.pill-below { grid-template-columns: minmax(0, 1fr); }
  .titles.pill-below > .sub { grid-column: 1; }
  .titles.pill-below > .chip { grid-area: auto / 1; justify-self: start; margin: 3px 0 0; }
  .titles.pill-dot .chip .txt { display: none; }
  .htext .titles.pill-dot .chip { padding: 4px; }
  @container dnsf-card (max-width: 200px) { .chip .txt { display: none; } }
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
export const DIALOG_STYLE = `
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
export const CONFIRM_GUARD_MS = 400;
export const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));
export const isOutside = (card, ev) => !ev.composedPath().includes(card) && !inDialog(ev);

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. It counts when the press and the release are both outside the card (a slider dragged out of the card
// does not fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through
// the click event. `tap(ev)` (press and release at the same spot) is for the tests.
export const watchOutside = (isOut, handler) => {
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
export const PAUSE_MINUTES = [5, 15, 30, 60, 120, 0];
export const hms = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;
