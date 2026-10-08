// The stars a weapon's ascension phases show, from none to the last one
export const ASCENSION_PHASE_COUNT = 6;
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
// The ornament the game's dividers wear, traced eight times enlarged from a recording of its health notice: the
// Interlocked double diamond at a divider's middle, on a 480 by 320 box, and the tapered diamond at its left end, on a
// 320 by 224 box, mirrored for the right
export const ORNAMENT_MIDDLE_PATH =
  "M 179.5 39 L 185.5 39 L 191 43.5 L 193 48.5 L 203 60.5 L 205 65.5 L 215 75.5 L 219 83.5 L 219 88.5 L 214.5 94 L 201.5 101 L 197.5 102 L 194 99.5 L 190.5 95 L 188.5 94 L 178.5 94 L 171 99.5 L 155.5 117 L 153 118.5 L 146.5 126 L 136.5 135 L 133.5 137 L 131.5 137 L 110.5 152 Q 104.23 153.73 100.5 158 L 91.5 160 L 87 163.5 Q 86.5 167.5 89.5 168 L 98.5 172 L 102.5 176 L 119.5 184 L 127.5 190 L 136.5 194 L 151 206.5 L 157.5 214 Q 159.75 213.25 159 215.5 L 165.5 223 L 170 226.5 Q 170.63 230.37 173.5 232 L 178.5 235 L 187.5 235 Q 188.5 232.5 191 233 Q 191.71 228.11 195.5 225 L 198.5 224 L 225 199.5 L 227.5 195 L 232.5 193 L 241.5 186 L 246.5 184 L 260 174.5 L 261.5 172 Q 267 170 270 165.5 L 270 162.5 L 265 157.5 L 265 154.5 L 268.5 150 Q 270.75 150.75 270 148.5 L 275.5 142 L 281.5 139 L 292.5 139 L 318.5 153 L 323.5 158 L 326.5 158 L 332.5 160 L 336 163.5 L 335 168 L 330.5 170 L 325.5 171 L 318.5 177 L 314.5 178 L 302.5 185 L 297.5 190 L 287.5 193 L 279.5 200 L 275.5 201 L 270.5 205 L 269 205 L 267.5 208 L 243.5 224 L 238 229.5 Q 238.75 231.75 236.5 231 L 216 249.5 L 214 253.5 L 201 267.5 L 192 280.5 L 189 287 L 186.5 288 L 183.5 288 L 182.5 289 L 179.5 289 L 173 285.5 L 169 274.5 Q 160.63 267.66 156 258 L 153 256.5 L 149 251.5 L 149 250 L 147 250 Q 148.13 247.33 145.5 248 L 132.5 233 L 129 232 L 129 230.5 L 122.5 224 L 119.5 223 L 108.5 214 L 95.5 208 L 89.5 203 L 85.5 201 L 74.5 199 L 69.5 195 L 54.5 190 L 48.5 186 L 30.5 180 L 0 180 L 0 149 L 31.5 149 L 35.5 147 L 44.5 147 L 49 145 Q 47.87 142.33 50.5 143 L 57.5 139 L 65.5 138 L 74.5 135 L 81.5 129 L 93.5 125 L 96.5 122 L 112.5 114 L 117 110.5 L 120.5 106 L 124.5 104 L 137 91.5 L 142.5 84 L 146 81.5 Q 150.3 73.8 157 68.5 L 164 56.5 L 177.5 40 L 179.5 39 Z  M 294.5 40 L 303.5 40 Q 304.75 43.5 308 43 L 313 53.5 L 329 71.5 L 338.5 85 Q 340.75 84.25 340 86.5 L 346.5 94 L 352 98.5 L 354 103 Q 363.2 105.9 368.5 114 L 374.5 117 L 376.5 117 L 385.5 124 L 397.5 128 L 407.5 135 L 409.5 135 L 412.5 137 L 422.5 139 L 424.5 141 L 430.5 144 L 432.5 144 L 434.5 146 Q 437.75 145.25 438.5 147 L 445.5 147 L 451.5 149 L 480 149 L 480 180 L 466.5 180 L 465.5 179 L 459.5 179 L 450.5 182 L 445.5 182 L 441.5 184 L 437.5 184 L 429.5 190 L 426.5 191 L 419.5 191 L 413.5 194 L 411.5 194 L 398.5 202 L 388.5 204 L 381.5 210 L 371.5 214 L 367 218.5 L 365.5 221 L 356.5 225 L 352 229.5 L 347.5 235 L 345 236.5 L 334.5 249 L 332 250.5 Q 332.75 252.75 330.5 252 L 326.5 257 L 324 258.5 L 319 267.5 L 312 276.5 L 312 278.5 L 304.5 288 L 294.5 288 L 289 282.5 L 288 279.5 L 280 269.5 L 279 266.5 L 267 253.5 L 264 245.5 L 264 240.5 L 265 237.5 L 268.5 234 L 273 230.5 L 275.5 227 L 278.5 226 L 286 226 Q 286.65 231.4 291.5 234 L 294.5 235 L 301.5 235 Q 307 233 310 228.5 L 312 224 L 313.5 224 L 325.5 212 L 327 212 L 327 210.5 L 335.5 202 L 346.5 193 L 356.5 190 L 363.5 183 L 375.5 178 L 382.5 173 L 389.5 171 L 394 166.5 L 394 163.5 L 390.5 160 L 379.5 157 L 373.5 151 L 359.5 145 L 348.5 137 L 345.5 136 L 332 123.5 L 326.5 117 L 323 114.5 L 306.5 96 L 302.5 94 L 296.5 93 Q 295.75 94.75 292.5 94 L 288 98.5 Q 287.75 103.25 284.5 105 Q 278 107.5 274.5 113 L 273 113 Q 274.13 115.67 271.5 115 L 260.5 127 L 250.5 136 L 241 141.5 L 239.5 144 L 238 144 Q 239.13 146.67 236.5 146 Q 232.09 150.09 225.5 152 L 212 163.5 L 211 166.5 L 212 167.5 L 212 174.5 L 206.5 182 L 197.5 190 L 188.5 191 L 170.5 181 L 167.5 178 L 161.5 176 L 157.5 172 L 148.5 169 L 145 165.5 L 147.5 161 L 158.5 156 L 166.5 151 L 168.5 151 L 176.5 147 L 181.5 142 L 193.5 137 L 202.5 129 L 211.5 126 L 215 123.5 L 219.5 118 L 224.5 115 L 233.5 107 L 237.5 105 L 242 100.5 L 246.5 95 L 249.5 94 L 255 89.5 L 257 85 L 260 83.5 L 267 73.5 L 287 51.5 L 292 41 L 294.5 40 Z ";
export const ORNAMENT_END_PATH =
  "M 210.5 53 L 216.5 53 L 224 59.5 L 227.5 65 L 238 73.5 L 242.5 79 L 249.5 82 Q 252.67 86.83 258.5 89 L 262.5 89 L 263.5 90 L 269.5 91 L 284.5 98 L 294.5 98 L 295.5 99 L 303.5 99 L 304.5 100 L 311.5 100 L 312.5 101 L 320 101 L 320 131.5 Q 319.88 132.63 314.5 132 L 313.5 133 L 307.5 133 L 306.5 134 L 289.5 134 Q 288.5 136 284.5 135 L 269.5 142 L 266.5 143 L 260.5 143 Q 254 145.5 250.5 151 L 235.5 160 L 226 169.5 L 221.5 177 L 214.5 180 L 208.5 180 L 205.5 179 L 193 168.5 Q 193.75 166.25 191.5 167 L 185.5 162 Q 177.28 160.22 172.5 155 L 159.5 151 L 156.5 148 L 148.5 145 L 131.5 142 L 125.5 138 L 116.5 137 L 110.5 134 L 101.5 133 L 90.5 129 L 83.5 129 L 79.5 127 L 75.5 127 L 74.5 126 L 60.5 124 L 55.5 122 L 44.5 122 Q 43.25 119.75 38.5 121 L 32 117.5 L 33 114 L 38.5 112 L 41.5 112 L 42.5 111 L 54.5 111 L 55.5 110 L 59.5 110 L 65.5 108 L 74.5 107 L 75.5 106 L 78.5 106 L 82.5 104 L 86.5 104 L 95.5 101 L 103.5 101 L 119.5 95 L 123.5 95 L 130.5 91 Q 134.5 92 135.5 90 L 142.5 90 L 143.5 89 L 147.5 89 L 153.5 87 L 163.5 80 L 172.5 78 L 188.5 67 L 191.5 66 L 198.5 59 L 210.5 53 Z ";
// The server bar's mark, a cream diamond holding a dark tick, traced eight times enlarged from the English client's
// Login screen at 1080 high, on a 46 unit square about its centre: the diamond, and the tick it holds
export const SERVER_MARK_DIAMOND_PATH =
  "M 23.44 6.62 L 24.44 7.25 L 25.88 8.56 L 26.31 9.12 L 28 10.56 L 28.56 11.25 L 28.88 11.44 L 29.44 12.12 L 30.25 12.81 Q 30.16 13.09 30.44 13 L 32.19 15 L 32.69 15.38 L 32.88 15.38 L 32.88 15.56 L 33.5 16.31 L 36.44 19.25 L 37.12 19.81 L 38.44 21.25 L 38.88 21.56 L 39.44 22.25 L 39.88 22.56 L 40.56 23.38 Q 40.84 23.28 40.75 23.56 Q 41.29 23.84 41.12 24.81 L 39.94 26.12 L 38.88 27.06 L 38.06 28 L 35.88 30.06 L 31.56 34.62 L 30.88 35.06 L 27.81 38.25 L 26.88 39.06 L 24.44 41.62 L 23.94 41.88 L 23.06 41.88 L 22.69 41.75 L 22.25 41.31 L 21.69 40.62 Q 21.41 40.72 21.5 40.44 L 19.12 38.19 L 18.94 37.88 L 18.25 37.31 L 17.69 36.62 L 17.38 36.44 L 17.19 36.12 L 16.25 35.44 L 15.56 34.62 Q 15.28 34.72 15.38 34.44 L 13.06 32 L 10.25 29.44 L 8.81 27.88 L 8.12 27.31 L 6.12 25.19 L 5.75 24.69 L 5.75 24.19 L 6 23.69 L 7.69 22 Q 7.97 22.09 7.88 21.81 Q 8.31 21.66 8.25 21.25 L 8.44 21.25 L 8.94 20.88 L 11 18.81 L 11.12 18.38 L 11.31 18.38 L 12.12 17.69 L 12.81 16.88 L 13.12 16.69 L 14.31 15.38 L 15.12 14.69 L 15.31 14.38 L 16.12 13.69 L 16.44 13.12 L 17 12.88 L 17 12.69 L 17.56 12.12 L 18.12 11.69 L 18.44 11.25 L 19.12 10.69 L 19.56 10.12 L 20.12 9.69 L 20.38 9.12 L 20.56 9.12 L 22.69 7.12 L 23.44 6.62 Z";
export const SERVER_MARK_TICK_PATH =
  "M 30.12 16.88 L 29.88 17 L 29.5 17.62 L 27 20.25 L 25.25 21.88 L 24 23.25 L 23.75 23.75 L 23.62 23.75 L 22.75 24.62 Q 22.88 24.88 22.62 24.75 L 21.88 25.62 L 20.62 26.62 L 20.25 26.5 L 19.62 26 L 19.12 25.5 L 18.62 25 L 18.12 24.5 L 16.75 23.25 L 16 23 L 15.62 23 L 15 23.25 Q 14.25 23.62 14 24.5 L 14 25.62 L 14.25 26.25 L 14.75 26.88 L 15.12 27 L 17.75 30 L 18.25 30.75 L 19.88 32 L 20.88 32 L 21.88 31.25 L 22.25 30.75 L 22.88 30.25 L 23.25 29.75 L 23.88 29.25 L 24.38 28.62 L 24.75 28.38 L 25.38 27.62 L 25.88 27.25 L 26.25 26.75 L 26.88 26.25 L 27.12 25.88 L 28 25.12 L 28.38 24.5 L 28.88 24.12 L 29.25 23.62 L 29.62 23.38 Q 30 23 30.25 22.5 L 31 22 L 31.12 21.75 L 31.88 21.12 L 33 20 Q 33.25 19.75 33.12 19.25 L 33.25 19.12 L 33.12 18.38 L 32.62 17.75 L 31.88 17 Q 31.25 17.12 31.25 16.88 L 30.12 16.88 Z";
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
