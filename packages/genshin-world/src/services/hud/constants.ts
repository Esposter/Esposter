import { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import { InputAction } from "genshin-engine";
import { GameTextKey } from "genshin-text";

// The touch layout's stick, held and at rest alike, measured on the mobile client's 16:9 recording (youtu.be/d9ZWM3cAlf0,
// 6.1, 33 held frames), whose canvas has no inset: its group's centre 199.5 canvas units in and 172.5 up from its
// Area's foot, where the tree's own rect puts it 102 in and up, so the game places it as it runs
export const TOUCH_STICK_POSITION: [number, number] = [199.5, 172.5];
// Provisional, until a recording of a drag is measured: the radians a pixel of a drag turns the look by
export const TOUCH_LOOK_RADIANS_PER_PIXEL = 0.005;
// The touch layout's action buttons' discs, a dark blue at a sixth over the world: inside the jump's, sprint's, skill's
// And attack's discs on `hud-world-pickup` the scene reads 0.84, 0.88 and 0.91 of itself just outside them, red to blue
export const ACTION_BUTTON_BACKGROUND = "rgb(0 27 61 / 0.16)";
// The share of the pool under which the stamina meter flashes red: on the climb `hud-stamina-climb` is taken from, its
// Fill is still yellow at a sixth of the arc and at an eighth (the clip's 32.75 and 32.83 seconds) and red from the next
// Frame on, as the pool empties
export const STAMINA_METER_LOW_SHARE = 0.125;
// The stamina each section of the meter holds, the arc cut at each multiple of it short of the pool
export const STAMINA_METER_SECTION = 100;

// The top right's shortcuts the world backs, in the game's order from the left, each the key that opens its screen and
// The Paimon menu's icon for it, which is the same art: the game's Events and Battle Pass stand before them, and join
// Once their screens are more than a placeholder
export const HUD_SHORTCUTS: readonly { icon: MenuEntryIcon; inputAction: InputAction; labelKey: GameTextKey }[] = [
  { icon: MenuEntryIcon.Wish, inputAction: InputAction.OpenWish, labelKey: GameTextKey.Wish },
  {
    icon: MenuEntryIcon.AdventurerHandbook,
    inputAction: InputAction.OpenAdventurerHandbook,
    labelKey: GameTextKey.AdventurerHandbook,
  },
  { icon: MenuEntryIcon.Inventory, inputAction: InputAction.OpenInventory, labelKey: GameTextKey.Inventory },
  { icon: MenuEntryIcon.Character, inputAction: InputAction.OpenCharacter, labelKey: GameTextKey.Character },
];

// Paimon's emblem on the HUD button, traced by `genshin:parity trace` from the English PC client's world HUD
// (`hud-world-keys`, the 90 pixel box at 16, 2 of the 1080 high still, enlarged four times), its paths in that
// Enlargement's pixels: a layer a tone from the bottom, each tone's pixels told apart by the nearest of the still's own
// Colours and each layer filled with its tone as sampled there. The whole head in the navy its star and eye show
// Through, then its white, the grey of its left lock, its crown's tan and its cape's blue
export const PAIMON_EMBLEM_LAYERS: readonly { color: string; path: string }[] = [
  {
    color: "#364f69",
    path: "M248.5 48l2.5 1.5-3 6v2l3 5-2 4.5-4 1v3h1.5l3 1 3-2 6.5 5.5 2 6 1 9-1.5 1.5h-7l-5.5-3.5-1-5.5q-3.33-1.31-2 3.5l-1 2.5h-3.5l-5-2-2.5 1v3.5q3.5 2.62 4 7.5l2.5 1h4q2.9-3.6 11-2l5 2 2.5 2.5 3 10 4.5 4.5h2l2 2h2l3 2h3l1.5 1.5 1 3v9l3.5 3.5 6.5 3.5-3.5 2.5q-4-1-5 1h-8l-3 1-2.5-1v-1.5q-3.25-1.75-4-6l-5.5-6.5q-2.25.75-1.5-1.5l-10-8-2.5-3.5-2.5-1.5q.75-2.25-1.5-1.5l-5-4h-11l-6-5h-1.5q.75 2.58-1 3.5v5l4 7-17 11q.75 2.25-1.5 1.5-1.13 2-4.5 1l-1 4q-3.81 1-5-1.5l2-3v-27l2.5-2.5 5 1 7.5-3q.75-3-1.5-4h-4.5v-1.5l-1-2.5q-2.87.5-4-2.5l-1-4-2.5-2.5-6-3h-4l-7-4h-3l-4-2q-4.75 1.25-6-1h-12l-3.5-2.5v-2l-3-4v-3l-4-7v-3.5h3.5l4.5 3.5 1.5 2.5h3l5-4h12l7 9 14-2 5 2 2.5 2.5q.75 4.25 4 6l1 3v5l1.5 1.5h9q.75 1.75 4 1 2.25-.75 1.5-4.5l-3.5-2.5h-2l-3.5-3.5 2.5-2.5q4.5 1 5.5-1.5l-1.5-1.5h-10l-2.5-2.5-3-5v-3.5l5.5-2h4l6-2q1 2 5 1l3.5 2.5 1 6 1.5 1.5q3 .5 3.5-1.5v-7l1.5-.5 3-1 8-6z M159.5 87h23l1 1h8l1.5 1.5q1.83 5.17 6 8l-1 2.5h-5v1.5l-2 6 1 1v11l-1 1v15q1.75.75 1 4-2 1 0 2l1.5 2.5q4.83.83 7-1l9-7 5-1 12.5-8.5 4-5v-2q-2.25-1.25.5-2.5h6l7.5 5.5 9 13 2 7 5 8 3 9 1 7 3 3 1 5 2 2 1 6 9.5 13.5 2.5 1.5 2.5 3.5 4 2h3.5v1.5l3.5 3.5q5.83-.83 7.5 2.5v5l-1 3-4.5 5.5-11 8h-11l-3-1-1.5 1.5-1 4 1 2-1 1v12q-1.75.75-1 4l-2 2v4l-1 2.5-3 1.5-2 6-11.5 16.5-3.5 1q-.25 4-3.5 6l-3 1-9 8-3 1-5 4-7 1-1 1h-18l-3-2-2 3q-2.5 2-8 1l-1.5 1.5q.75 3.75-1.5 4.5-7.25-1.25-8.5 3.5v4.5h-1.5l-2-1-4.5 4.5 1 1q1.12 3.33-1.5 2.5-.75 1.75-4 1l-1.5 1.5q-1.83 2.32-1 6.5h-7.5l-1 1h-22l-1 1h-30l-1-1h-6l-3.5-2.5q.75-3.75-1.5-4.5l-3 1-3.5-3.5v-12l2.5-2.5h6l1-1h6.5q-.87-6.17 1-9h5.5l1.5-1.5-1.5-1.5-14-1-1.5 1.5.5 1.5-3 1-3-5-2-1-12-1-1.5-1.5q1-5-2-6v-8.5h-4.5l-1.5-1.5v-4.5h6.5q2-.5 1.5-3.5l-1-1-1-6-2-2-2-6v-19l1-1v-7l4-7 1-7-1.5-1.5q-4.17.67-6-1l-3-3q-4.75-.25-6.5-3.5-.5-3 1.5-3.5 7.25-.25 9.5-5.5l2.5-3.5 2.5-1.5v-3l4-10.5q2.88.5 4-2.5l1-6 3-5q-.75-3.25 1-4v-6l2-3 1-8 4-9v-2l4-5v-2l3-5 9-10v-1.5q2.88.5 4-2.5-.75-2.25 1.5-1.5l5-5h1.5q-1.12-2.67 1.5-2l15-9q5.64-.86 9-4h3l5-3q3.25.75 4-1h9l1-1z",
  },
  {
    color: "#fbfdff",
    path: "M151.5 88h39l1.5 1.5v2l4 5v1.5q-2.87-.5-4 2.5.75 3.25-1 4v30l-1 1v6l2.5 3.5 2 1 6-2 9-7 5-1 3-3 9-5 4.5-4.5 1-3.5 4.5-1q.75 1.75 4 1l3.5 2.5 4 7 3 3 5 12 4 5 1 6 3 5v6l1.5 1.5q2.63-.83 1.5 2.5l5 14 9.5 12.5q2.25-.75 1.5 1.5l4.5 4.5 4 1 4 4 8.5 2 1 2.5q-1.75.75-1 4l-4 5v1.5h-1.5l-10 8-5 1-1-1h-5l-3-1-2.5 2.5v14l-1 1-1 7-2 3v4l-4 5-9 16-3 3v1.5q-4 .25-6 3.5l-2 4.5-3.5 1-10 8-7 4h-4l-5 2h-14l-7-3h-3l-5.5-4.5 1.5-2.5 4 1 3.5-2.5q1.13-3.33-1.5-2.5l-8.5-7.5v-2l-2.5-3.5h-4l-5 4q-3.25-.75-4 1h-9.5l1.5-3 7-1 4.5-4.5 4-6 1-7 1-1v-4l-3.5-6.5-3.5 2.5v7l-3 6-9.5 9.5-16 9h-4l-4 2q-4.75-1.25-6 1h-8l-1-1h-7q-2.32-3.18-7-4l-5.5-5.5-4-5v-2l2.5-2.5h12l4-4 4.5-2.5q.83-2.62-2.5-1.5l-2 1-4.5-3.5-1.5-2.5-3.5-2.5q-.75-4.25-4-6-.86-5.64-4-9v-5l8-9 1-3v-5.5q-6.72-.83-11.5-5h-2l-1.5 1.5v3l-4 7v4l-4 6-1 6-2 4q1.25 4.75-1 6v22q2.25 1.25 1 6 3.37 2.98 4 7.5 2.87-.5 4 2.5l-1.5 2.5h-3l-5-3-13.5-12.5v-3l-4-6q.75-3.25-1-4v-21l1-1v-6l3-4 1-5 2-3v-3q-1.5-3-7.5-1.5-3.36-3.14-9-4l-2.5-2.5q-.5-3 1.5-3.5h4l4-4h1.5v-1.5l3.5-3.5q2.25.75 1.5-1.5l5-10v-2l3-3v-3l6-10v-9l2-5v-4l3-6 2-8 3-3 4-8 8.5-10.5 2.5-1.5 2.5-3.5 8-7 6-2q2.32-3.18 7-4l3-3 5-1 2-2h3l12-5zm-11.5 30q0 3 2 4-1 3 1 5v15l-3 4-1 7-12 13v2l3 2q6 0 9 3h4l3 3 4 1 4 4h1v2l4 4q1 4 4 7l1 5q1 3 5 2v-8l-1-1v-14l6-13 7-7 3-1 2-3-2-3h-7l-2-2-6-2-9-5q1-3-1-2l-2-2-2-2-6-8-1-6-4-4h-4zm-62 64-3 4q-1 3 1 4-2 6 3 4v-8l-1-4zm34 4-4 4v3l1 2h2l4-3 4 1 7 7h2l3 5 5 4h1q1-5-1-7-1-3-4-2-3-1-3-4-5-1-7-4-3 1-2-1-2-5-8-5zm80 15v8l2 2q-1 3 1 4v10l1 1v7l1 1q1 4-1 6v16l-1 1v7q-4 0-3 7l-7 7v2l7 4h5l6-3h2l3-3 5-10v-21l-1-1v-7l-5-11 2-3h12v-1l-2-3-9-3-5-3-7-7-2-4v-3h-4zm-66 18-1 1q-3-1-2 2l-1 1h-3l-6 2-4 4v2l4 2 4-1 8-5 4-5-3-3z",
  },
  {
    color: "#929798",
    path: "M140 118h3.5l4.5 3.5 1 6h-1l-1-4-1.5-1.5-1.5 1.5v10q2 1 1 5-1.75.75-1 4l-3 4-1 7-9.5 10.5h-1.5v4l2.5 1h4l3 2 5 1q1.85 3.65 7 4l10.5 10.5v2l3 4 1 5.5 3-1.5-2-14 1-1 1-8 5-10 5.5-5.5 1.5.5-6 6-5 10-1 3v14l1 1v8.5q-3.83.75-5-2.5l-1-5q-3.18-2.32-4-7l-4-4v-1.5h-1.5l-4-4-4-1-3-3h-4q-2.96-3.04-9-3l-2.5-2.5v-2l12-13 1-7 3-4v-15q-2-1-1-5-2.5-1-2-3.5z M168.5 147h2l6 4h7l2.5 2.5-2.5 3.5-1.5-.5 2-3-1.5-1.5h-7l-7-4v-1z M77.5 182l1.5 3.5v8.5q-4.87 1.8-3-4.5-1.75-.75-1-4l2.5-3.5z M111.5 186q6.42.08 8.5 4.5-.75 2.25 1.5 1.5 2.98 3.37 7.5 4-.5 2.88 2.5 4 3.75-.75 4.5 1.5 2 2.62 1 7.5h-1.5l-4.5-4.5-3.5-4.5h-2l-7-7-4-1-4 3h-1.5l-1-2.5v-3l3.5-3.5z M192 201h4v2.5l-1.5-.5h-1.5v5q3-1.25 2 2.5l1 1q-1.25 4.75 1 6v10l2 6v5l-1 1v9l-1 1v12l-4 7-1 4-5 6 4.5 3.5h5l4-2h3l3.5-3.5 1-4 3-3q-1-4 1-5v-16l-1-1v-7l-2-3-3-9-1-6.5q2.5-.5 3.5 2h6l1.5-3-4-1.5 2.5-.5 6.5 4.5-.5 1.5h-12l-1.5 2.5 5 11v7l1 1v21l-5 10-3.5 3.5h-2l-6 3h-5l-6.5-4.5v-2l7-7q-1-6 3-7v-7l1-1v-16q2.25-1.25 1-6l-1-1v-7l-1-1v-10q-1.75-.75-1-4l-2-2v-7.5z M92.5 214l4.5 1.5-3.5.5-1.5 1.5v3l-4 7v3l-4 6-1 9-2 4v10l-1 1v7l1 1v7q1.75.75 1 4l3 6.5q2.88-.5 4 2.5v4.5h-6.5l-9.5-6.5-2-3 1.5-.5 6 6 5 3h3l1.5-2.5q-1.13-3-4-2.5-.63-4.52-4-7.5 1.25-4.75-1-6v-22l1-1v-5l2-4 1-6 4-6v-4l4-7v-3l1.5-1.5z M125.5 219l3.5 2.5-4.5 5.5-8 5-4 1-3.5-2.5v-2l3.5-3.5 6-2h3l1.5-1.5q-.75-2.25 1.5-1.5l1-1zm-1.5 2v2l-3 2h-4l-4 2q-3 1-2 4h5l9-7h2q2-4-3-3z M101.5 230l.5 1.5-5 5v5q3.14 3.36 4 9l3 4-.5.5-3.5-3.5q-.86-5.64-4-9v-7l5.5-5.5z M173.5 255l2.5 1.5 2 5v4l-1 1v4l-2 5-7.5 8.5h-4l-4.5 2.5.5 1.5h9q.75-1.75 4-1v1l-7 1-1 1h-8.5l-1-4h-4.5l-3 2h-2v-1l13-7 9.5-9.5 3-6v-7l2.5-2.5zm-.5 2-1 3v5l-3 7-9 8q-3 1-3 4 3 1 5-1h5l8-10 1-6 1-1v-3l-2-4q1-3-2-2z M112 264l3.5 1q.92-1.75 3.5-1l-1.5 3q-5 1-7 5h-12v-1h10l4.5-3.5-1-3.5z M109.5 289l3 2 16 1q1.25-2.25 6-1l4-2h4q1.5 1-1 2l-11 1-1 1h-11l-1-1h-6l-2.5-2.5.5-.5z M227.5 305l1.5.5-4.5 3.5-7 1-1 1h-18l-3-2-5.5-1.5 3.5-.5 7 3h14l5-2h4l4-3z",
  },
  {
    color: "#edc898",
    path: "M248.5 48l2.5 1.5-3 6v2l3 5-2 4.5-4 1v3h1.5l3 1 3-2 6.5 5.5 2 6 1 9-1.5 1.5h-7l-5.5-3.5-1-5.5q-3.33-1.31-2 3.5l-1 2.5h-3.5l-5-2-2.5 1v3.5q3.5 2.62 4 7.5l2.5 1h4q2.9-3.6 11-2l5 2 2.5 2.5 3 10 4.5 4.5h2l2 2h2l3 2h3l1.5 1.5 1 3v9l3.5 3.5 6.5 3.5-3.5 2.5q-4-1-5 1h-8l-3 1-2.5-1v-1.5q-3.25-1.75-4-6l-5.5-6.5q-2.25.75-1.5-1.5l-5-5q.75-3.75-1.5-4.5h-4l-4.5-3.5q.75-2.25-1.5-1.5l-5-4h-11l-6-5h-1.5q.75 2.58-1 3.5v5l4 7-17 11q.75 2.25-1.5 1.5l-9 3-.5-1.5 1-1v-27l2.5-2.5 5 1 7.5-3q.75-3-1.5-4h-4.5v-1.5l-1-2.5q-2.87.5-4-2.5l-1-4-2.5-2.5-6-3h-4l-7-4h-3l-4-2q-4.75 1.25-6-1h-12l-3.5-2.5v-2l-3-4v-3l-4-7v-3.5h3.5l4.5 3.5 1.5 2.5h3l5-4h12l7 9 14-2 5 2 2.5 2.5q.75 4.25 4 6l1 3v5l1.5 1.5h9q.75 1.75 4 1 2.25-.75 1.5-4.5l-3.5-2.5h-2l-3.5-3.5 2.5-2.5q4.5 1 5.5-1.5l-1.5-1.5h-10l-2.5-2.5-3-5v-3.5l5.5-2h4l6-2q1 2 5 1l3.5 2.5 1 6 1.5 1.5q3 .5 3.5-1.5v-7l1.5-.5 3-1 8-6z",
  },
  {
    color: "#416aa0",
    path: "M202 260h5v8.5l1.5.5 2-4 .5 4.5-3 3-1 4-3.5 3.5h-3l-4 2h-5l-4.5-3.5 1.5-2.5 2 4 4 1q1.5-3.5 8-2l3.5-3.5 1-4.5q-3-.75-4 1.5.87 3-3.5 1.5l-1.5-1.5v-4.5l3-1.5q1.83-2.32 1-6.5z M81.5 270l1.5 3.5v5l3 6.5q4.5 1.75 3-3.5.5-2 3.5-1.5l3-3q2.2 6.8 8 10 5.39 1.11 8 5h6l1 1h11l1-1 11-1 2-2 7-3h4.5l1 4h8.5q.75-1.75 4-1v1l-3.5 1q-.5 3.25 3 4.5-2 1.12-1 4.5h1.5l3.5-3.5q-.75-2.25 1.5-1.5l4-3h4.5l.5-5 3 5 5 4h1.5q.75 3-1.5 4l-5-1q-2.25.75-1.5 4.5l4.5 3.5 6.5 2.5-4.5.5-9 4h-4.5l1 4-5.5 2-2-1-2.5 1v6.5l-1.5 1.5-4-1-2.5 2.5v3l-1 2.5-14 3-1 4h-4.5l-5 2h-38q-1-3-6-2-1.25 2.25-2.5-.5v-4.5h-1.5q-1-2-5-1l-2.5-2.5v-5l2-2q-1-4.5 1.5-5.5l5 1q1.25-2.25 6-1l3.5-2.5-2-6 1-2.5h9.5q1 2 5 1l2.5-4.5q-.75-3.25-5.5-2.5l-1 1h-11l-1-1h-13l-5-5-4-2h-5l-3.5-2.5-1-8.5 7.5 1 .5-.5-3.5-3.5-3.5-2.5 2.5-.5 6.5 5.5 2.5 3.5 7 4h6.5q1.25-5.5-2.5-7-2.25.75-1.5-1.5l-3-5q.75-3.25-1-4l.5-5.5zm31.5 24v2h23l2-1v-1h-10l-1 1q-5 1-5-1h-9z",
  },
];
