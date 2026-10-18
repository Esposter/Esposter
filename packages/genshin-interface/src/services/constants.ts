import type { CanvasRect } from "#src/models/CanvasRect";

// The stars a weapon's ascension phases show, from none to the last one
export const ASCENSION_PHASE_COUNT = 6;
// The game's own face first, for a reader who has it installed, since it is a commercial face nothing may ship; then
// Signika, the open face nearest it: set the game's own lines (a large frame of its notice) in each of seventy open
// Candidates, scale each line to the game's box, and Signika's ink overlaps the game's most. The host loads it: the
// App through its fonts module, the parity page and the visual suite from `@fontsource/signika`
export const GAME_FONT_FAMILY = '"HYWenHei 85W", "HYWenHei-85W", Signika, ui-sans-serif, sans-serif';
// The game lays its interface out on a 1920 by 1080 screen scaled to fit the window's height or its width, whichever
// Is less, and then by the client's interface scale, so a unit is that screen's pixel in the window's own container
export const GAME_UNIT = "calc(min(100cqh / 1080, 100cqw / 1920) * var(--interface-scale))";
// The game's interface canvas: its RectTransforms are laid out on a 1600 by 900 reference, scaled to fit the window's
// Smaller axis as the screen is, so a canvas unit is 1.2 screen units at 1080 high (a piece 128 plus 32 canvas units
// Up reads 192 pixels on the 1080 high recording)
export const GAME_CANVAS_UNIT = "calc(min(100cqh / 900, 100cqw / 1600) * var(--interface-scale))";
// How far the canvas stands in from each side of a screen wider than 16:9: its spare width, up to 71 screen units,
// As the corner buttons show on a 2560 by 1080 and a 3440 by 1440 recording alike, so the game widens its margin
// By a fixed step rather than by all the spare width. A piece anchored to a side rides on the canvas's side, not
// The screen's. The spare width is the window's own, whatever the interface's scale
export const GAME_CANVAS_INSET = "min(var(--unit) * 71, (100cqw - min(100cqh * 16 / 9, 100cqw)) / 2)";
// The mobile client draws its whole interface a quarter larger than the PC client, its canvas 1280 by 720 where the
// PC's is 1600 by 900, fitted to the smaller axis as the PC's is. Its HP bar, the 512 by 20 container at half scale,
// Puts the canvas 720 high on five phone recordings from 16:9 to 20:9 and 1280 wide on three tablets at 4:3 and
// 1.44:1, and the Paimon button, the quest toggle and the chat button stand 71 of its screen units in
export const MOBILE_INTERFACE_SCALE = 1.25;
// The canvas as a rect of its own, the full screen's: a piece whose parent rect is this one is laid on the canvas
export const GAME_CANVAS_RECT: CanvasRect = {
  anchorMax: [1, 1],
  anchorMin: [0, 0],
  pivot: [0, 0],
  position: [0, 0],
  size: [0, 0],
};
// The white the game's opening is drawn on, a step under full white: the PC client's screens read 253 on the user's own
// Recording and on a 2023 one alike, where a phone's and an older build's read 255
export const GAME_WHITE = "#fdfdfd";
// The game's own cream, ink and gold, read off its button clips' colours (block 07356235): the cream its pills and
// Lit icons are drawn in, the ink a cream pill's words are, and the gold the side bar's icons rest in
export const GAME_CREAM = "#ece5d8";
export const GAME_INK = "#3b4354";
export const GAME_GOLD = "#d3bc8e";
// The game's pointer, a four pointed star with its point at the upper left: a white and a cream facet either side of
// Its diagonal, and a gold star within it lit from its inner corner, traced from the wiki's render of its tutorial
// On a 64 unit square with its point at the origin. It is 25 pixels across on a 1080 high screen, where the game
// Draws it at its own size, as a cursor is
const GAME_CURSOR_SIZE = 26;
const GAME_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${GAME_CURSOR_SIZE}" height="${GAME_CURSOR_SIZE}" viewBox="-2 -2 66 66"><defs><radialGradient id="g" cx="28" cy="28" r="34" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffea00"/><stop offset="0.45" stop-color="#ffc800"/><stop offset="1" stop-color="#ffc100"/></radialGradient></defs><path d="M0 0q30.1 11.4 62 15-14.5 21.1-3 44-22.9-11.5-44 3-3.6-31.9-15-62z" fill="none" stroke="#2c3a4e" stroke-opacity="0.75" stroke-width="3" stroke-linejoin="round"/><path d="M0 0q30.1 11.4 62 15-14.5 21.1-3 44z" fill="#fff"/><path d="M0 0L59 59Q36.1 47.5 15 62Q11.4 30.1 0 0Z" fill="#f4f5e0"/><path d="M26 26q21.5 6 36-11-14.5 21.1-3 44-22.9-11.5-44 3 17-14.5 11-36z" fill="url(#g)"/></svg>`;
export const GAME_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(GAME_CURSOR_SVG)}") 1 1, auto`;
// The ornament the game's dividers wear, traced eight times enlarged from a recording of its health notice: the
// Interlocked double diamond at a divider's middle, on a 480 by 320 box, and the tapered diamond at its left end, on a
// 320 by 224 box, mirrored for the right
export const ORNAMENT_MIDDLE_PATH =
  "M179.5 39h6l5.5 4.5 2 5 10 12 2 5 10 10 4 8v5l-4.5 5.5-13 7-4 1-3.5-2.5-3.5-4.5-2-1h-10l-7.5 5.5-15.5 17.5-2.5 1.5-6.5 7.5-10 9-3 2h-2l-21 15q-6.27 1.73-10 6l-9 2-4.5 3.5q-.5 4 2.5 4.5l9 4 4 4 17 8 8 6 9 4 14.5 12.5 6.5 7.5q2.25-.75 1.5 1.5l6.5 7.5 4.5 3.5q.63 3.87 3.5 5.5l5 3h9q1-2.5 3.5-2 .71-4.89 4.5-8l3-1 26.5-24.5 2.5-4.5 5-2 9-7 5-2 13.5-9.5 1.5-2.5q5.5-2 8.5-6.5v-3l-5-5v-3l3.5-4.5q2.25.75 1.5-1.5l5.5-6.5 6-3h11l26 14 5 5h3l6 2 3.5 3.5-1 4.5-4.5 2-5 1-7 6-4 1-12 7-5 5-10 3-8 7-4 1-5 4h-1.5l-1.5 3-24 16-5.5 5.5q.75 2.25-1.5 1.5l-20.5 18.5-2 4-13 14-9 13-3 6.5-2.5 1h-3l-1 1h-3l-6.5-3.5-4-11q-8.37-6.84-13-16.5l-3-1.5-4-5v-1.5h-2q1.13-2.67-1.5-2l-13-15-3.5-1v-1.5l-6.5-6.5-3-1-11-9-13-6-6-5-4-2-11-2-5-4-15-5-6-4-18-6h-30.5v-31h31.5l4-2h9l4.5-2q-1.13-2.67 1.5-2l7-4 8-1 9-3 7-6 12-4 3-3 16-8 4.5-3.5 3.5-4.5 4-2 12.5-12.5 5.5-7.5 3.5-2.5q4.3-7.7 11-13l7-12 13.5-16.5 2-1zm115 1h9q1.25 3.5 4.5 3l5 10.5 16 18 9.5 13.5q2.25-.75 1.5 1.5l6.5 7.5 5.5 4.5 2 4.5q9.2 2.9 14.5 11l6 3h2l9 7 12 4 10 7h2l3 2 10 2 2 2 6 3h2l2 2q3.25-.75 4 1h7l6 2h28.5v31h-13.5l-1-1h-6l-9 3h-5l-4 2h-4l-8 6-3 1h-7l-6 3h-2l-13 8-10 2-7 6-10 4-4.5 4.5-1.5 2.5-9 4-4.5 4.5-4.5 5.5-2.5 1.5-10.5 12.5-2.5 1.5q.75 2.25-1.5 1.5l-4 5-2.5 1.5-5 9-7 9v2l-7.5 9.5h-10l-5.5-5.5-1-3-8-10-1-3-12-13-3-8v-5l1-3 3.5-3.5 4.5-3.5 2.5-3.5 3-1h7.5q.65 5.4 5.5 8l3 1h7q5.5-2 8.5-6.5l2-4.5h1.5l12-12h1.5v-1.5l8.5-8.5 11-9 10-3 7-7 12-5 7-5 7-2 4.5-4.5v-3l-3.5-3.5-11-3-6-6-14-6-11-8-3-1-13.5-12.5-5.5-6.5-3.5-2.5-16.5-18.5-4-2-6-1q-.75 1.75-4 1l-4.5 4.5q-.25 4.75-3.5 6.5-6.5 2.5-10 8h-1.5q1.13 2.67-1.5 2l-11 12-10 9-9.5 5.5-1.5 2.5h-1.5q1.13 2.67-1.5 2-4.41 4.09-11 6l-13.5 11.5-1 3 1 1v7l-5.5 7.5-9 8-9 1-18-10-3-3-6-2-4-4-9-3-3.5-3.5 2.5-4.5 11-5 8-5h2l8-4 5-5 12-5 9-8 9-3 3.5-2.5 4.5-5.5 5-3 9-8 4-2 4.5-4.5 4.5-5.5 3-1 5.5-4.5 2-4.5 3-1.5 7-10 20-22 5-10.5 2.5-1z";
export const ORNAMENT_END_PATH =
  "M210.5 53h6l7.5 6.5 3.5 5.5 10.5 8.5 4.5 5.5 7 3q3.17 4.83 9 7h4l1 1 6 1 15 7h10l1 1h8l1 1h7l1 1h7.5v30.5q-.12 1.13-5.5.5l-1 1h-6l-1 1h-17q-1 2-5 1l-15 7-3 1h-6q-6.5 2.5-10 8l-15 9-9.5 9.5-4.5 7.5-7 3h-6l-3-1-12.5-10.5q.75-2.25-1.5-1.5l-6-5q-8.22-1.78-13-7l-13-4-3-3-8-3-17-3-6-4-9-1-6-3-9-1-11-4h-7l-4-2h-4l-1-1-14-2-5-2h-11q-1.25-2.25-6-1l-6.5-3.5 1-3.5 5.5-2h3l1-1h12l1-1h4l6-2 9-1 1-1h3l4-2h4l9-3h8l16-6h4l7-4q4 1 5-1h7l1-1h4l6-2 10-7 9-2 16-11 3-1 7-7 12-6z";
// The game's green tick, the mark a finished commission and an achieved Reputation level wear, traced from the game's
// Mark on a 252 by 228 box: its ink spans 220 by 180 of it, from 21 across and 24 down
export const CHECK_MARK_PATH =
  "M237.5 26q5.25-1.75 3.5 3.5l-6 11-5 5-4 7-4 4-9 14-3 3-1 3-4 4-1 3-12 17-7 12-9 11-5 9-14 19-1 3-4 4-7 12-8 10-1 3-4 4-2 5-3 3v2l-3.5 4.5-6 2-11-6-2.5-2.5-3.5-4.5-16-11-13.5-12.5q-1.25-5.75-5.5-8.5l-7-2-5-3-13-12-8-3h-6l-3-1-2.5-2.5v-2l3-6 26.5-36.5 5-3h5l5.5 4.5q-.75 2.25 1.5 1.5l16.5 17.5 1 3 13 13 5.5 9.5 7 1 18-13 12-12 21-18 10-10 8-6 19.5-18.5 2.5-3.5 12-9q10.85-12.15 24-22z";
// The server bar's mark, a cream diamond holding a dark tick, traced eight times enlarged from the English client's
// Login screen at 1080 high, on a 46 unit square about its centre: the diamond, and the tick it holds
export const SERVER_MARK_DIAMOND_PATH =
  "M23.44 6.62l1 .63 1.44 1.31.43.56 1.69 1.44.56.69.32.19.56.68.81.69q-.09.28.19.19l1.75 2 .5.38h.19v.18l.62.75 2.94 2.94.68.56 1.32 1.44.44.31.56.69.44.31.68.82q.28-.1.19.18.54.28.37 1.25l-1.18 1.31-1.06.94-.82.94-2.18 2.06-4.32 4.56-.68.44-3.07 3.19-.93.81-2.44 2.56-.5.26h-.88l-.37-.13-.44-.44-.56-.69q-.28.1-.19-.18l-2.38-2.25-.18-.31-.69-.57-.56-.69-.31-.18-.19-.32-.94-.68-.69-.82q-.28.1-.18-.18l-2.32-2.44-2.81-2.56-1.44-1.56-.69-.57-2-2.12-.37-.5v-.5l.25-.5 1.69-1.69q.28.09.19-.19.43-.15.37-.56h.19l.5-.37 2.06-2.07.12-.43h.19l.81-.69.69-.81.31-.19 1.19-1.31.81-.69.19-.31.81-.69.32-.57.56-.24v-.19l.56-.57.56-.43.32-.44.68-.56.44-.57.56-.43.26-.57h.18l2.13-2 .75-.5z";
export const SERVER_MARK_TICK_PATH =
  "M30.12 16.88l-.24.12-.38.62-2.5 2.63-1.75 1.63-1.25 1.37-.25.5h-.13l-.87.87q.13.26-.13.13l-.74.87-1.26 1-.37-.12-.63-.5-.5-.5-.5-.5-.5-.5-1.37-1.25-.75-.25h-.38l-.62.25q-.75.37-1 1.25v1.12l.25.63.5.63.37.12 2.63 3 .5.75 1.63 1.25h1l1-.75.37-.5.63-.5.37-.5.63-.5.5-.63.37-.24.63-.76.5-.37.37-.5.63-.5.24-.37.88-.76.38-.62.5-.38.37-.5.37-.24q.38-.38.63-.88l.75-.5.12-.25.76-.63 1.12-1.12q.25-.25.12-.75l.13-.13-.13-.74-.5-.63-.74-.75q-.63.12-.63-.12h-1.13z";
// The settings gear's grey ring, between its hub's hole and its body, on the glyph's 48 unit square
export const SETTINGS_RING_CENTRE = [24.05, 24.9] as const;
export const SETTINGS_RING_RADIUS = 9.85;
export const SETTINGS_RING_WIDTH = 1.9;
// Joins a component's name to its fixture's variant in its approved image's name, in both packages' visual suites.
// A file name, so not `ID_SEPARATOR`: a vertical bar is one of the characters Windows rejects in a path
export const FIXTURE_VARIANT_SEPARATOR = "-";
// The key the prompts' selected row is marked with, the game's default for Pick Up and Interact
export const INTERACTION_KEY_LABEL = "F";
// Each constellation ring's top left from the panel's top left, in units, read off the reference's six rings: their
// Centres sit 111 units apart down the panel, bowing right at the middle and back left at the ends
export const CONSTELLATION_NODE_PLACES: readonly { left: number; top: number }[] = [
  { left: 15.25, top: 116 },
  { left: 69.25, top: 227 },
  { left: 105.25, top: 338.75 },
  { left: 105.25, top: 449.75 },
  { left: 69.25, top: 560.75 },
  { left: -2.75, top: 671.75 },
];
// How long a button takes to reach each state, the crossfade its animator's transitions into the state run over in the
// Game's own button controllers (block 07356235): a hover in 0.05 seconds, back to rest in 0.1 and a press at once
export const INTERACTION_HOVER_MS = 50;
export const INTERACTION_REST_MS = 100;
// The cream pill's own controllers take twice as long back to rest
export const INTERACTION_PILL_REST_MS = 200;
// A press plays its own clip over its 10 frames at 60: a cream pill's gold light fading as its words turn cream
export const INTERACTION_PRESS_MS = 167;
// The game's ease in and out, Unity's default curve, a smoothstep: its clips' samples read 0.028, 0.104 and 0.216 at a
// Tenth, a fifth and three tenths of the way, and a cubic bezier with its handles at the thirds is exactly that
export const GAME_SMOOTHSTEP_EASING = "cubic-bezier(0.333, 0, 0.667, 1)";
// The tints a rectangular row takes over its own box, hovered and pressed. Provisional: the game draws no state for a
// Plain button, so no recording gives a row's tint: these are the jump list's hover tint, and a press a step stronger
export const GAME_ROW_HOVER = "rgb(255 255 255 / 0.2)";
export const GAME_ROW_PRESS = "rgb(255 255 255 / 0.3)";
// The dialogue reply's pill, a fifth black over the scene at rest, measured off the English client's dialogue choices
// (the reply frame the dialogue page is placed by). Its hover and press are Provisional: no recording shows a reply under
// The pointer, so they are the look a lit reply took before the kind, a white pill with its words slate
export const GAME_REPLY_REST = "rgb(0 0 0 / 0.22)";
export const GAME_REPLY_HOVER = "rgb(255 255 255 / 0.85)";
export const GAME_REPLY_HOVER_INK = "#3b4255";
// The cooking bar is the top half of an ellipse on the 1920 by 1080 stage, running from its left end to its right end:
// Its centre and its two radii
export const COOKING_ARC_CENTRE_X = 960;
export const COOKING_ARC_CENTRE_Y = 832;
export const COOKING_ARC_RADIUS_X = 435;
export const COOKING_ARC_RADIUS_Y = 120;
