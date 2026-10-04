// The game's own face first, for a reader who has it installed, since it is a commercial face nothing may ship; then
// Signika, the open face nearest it: set the game's own lines (a large frame of its notice) in each of seventy open
// Candidates, scale each line to the game's box, and Signika's ink overlaps the game's most. The host loads it: the
// App through its fonts module, the parity page and the visual suite from `@fontsource/signika`
export const GAME_FONT_FAMILY = '"HYWenHei 85W", "HYWenHei-85W", Signika, ui-sans-serif, sans-serif';
// The game lays its interface out on a 1920 by 1080 screen scaled to fit the window's height or its width, whichever
// Is less, so a unit is that screen's pixel in the window's own container
export const GAME_UNIT = "min(100cqh / 1080, 100cqw / 1920)";
// The game's interface canvas: its RectTransforms are laid out on a 1600 by 900 reference, scaled to fit the window's
// Smaller axis as the screen is, so a canvas unit is 1.2 screen units at 1080 high (a piece 128 plus 32 canvas units
// Up reads 192 pixels on the 1080 high recording)
export const GAME_CANVAS_UNIT = "min(100cqh / 900, 100cqw / 1600)";
// How far the canvas stands in from each side of a screen wider than 16:9: its spare width, up to 71 screen units,
// As the corner buttons show on a 2560 by 1080 and a 3440 by 1440 recording alike, so the game widens its margin
// By a fixed step rather than by all the spare width. A piece anchored to a side rides on the canvas's side, not
// The screen's
export const GAME_CANVAS_INSET = "min(var(--unit) * 71, (100cqw - var(--unit) * 1920) / 2)";
// The white the game's opening is drawn on, a step under full white: the PC client's screens read 253 on the user's own
// Recording and on a 2023 one alike, where a phone's and an older build's read 255
export const GAME_WHITE = "#fdfdfd";
// The game's pointer, a four pointed star with its point at the upper left: a white and a cream facet either side of
// Its diagonal, and a gold star within it lit from its inner corner, traced from the wiki's render of its tutorial
// On a 64 unit square with its point at the origin. It is 25 pixels across on a 1080 high screen, where the game
// Draws it at its own size, as a cursor is
const GAME_CURSOR_SIZE = 26;
const GAME_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${GAME_CURSOR_SIZE}" height="${GAME_CURSOR_SIZE}" viewBox="-2 -2 66 66"><defs><radialGradient id="g" cx="28" cy="28" r="34" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffea00"/><stop offset="0.45" stop-color="#ffc800"/><stop offset="1" stop-color="#ffc100"/></radialGradient></defs><path d="M0 0Q30.1 11.4 62 15Q47.5 36.1 59 59Q36.1 47.5 15 62Q11.4 30.1 0 0Z" fill="none" stroke="#2c3a4e" stroke-opacity="0.75" stroke-width="3" stroke-linejoin="round"/><path d="M0 0Q30.1 11.4 62 15Q47.5 36.1 59 59Z" fill="#fff"/><path d="M0 0L59 59Q36.1 47.5 15 62Q11.4 30.1 0 0Z" fill="#f4f5e0"/><path d="M26 26Q47.5 32 62 15Q47.5 36.1 59 59Q36.1 47.5 15 62Q32 47.5 26 26Z" fill="url(#g)"/></svg>`;
export const GAME_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(GAME_CURSOR_SVG)}") 1 1, auto`;
// The settings gear's grey ring, between its hub's hole and its body, on the glyph's 48 unit square
export const SETTINGS_RING_CENTRE = [24.05, 24.9] as const;
export const SETTINGS_RING_RADIUS = 9.85;
export const SETTINGS_RING_WIDTH = 1.9;
// Joins a component's name to its fixture's variant in its approved image's name, in both packages' visual suites.
// A file name, so not `ID_SEPARATOR`: a vertical bar is one of the characters Windows rejects in a path
export const FIXTURE_VARIANT_SEPARATOR = "-";
