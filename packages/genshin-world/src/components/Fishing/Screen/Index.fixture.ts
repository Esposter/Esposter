import { ENGLISH_GAME_TEXT } from "genshin-text";

// The reel at the instant yt-iKr-nF1P7xQ-fishing-reel.mkv shows at 52.5 seconds.
// A hooked fish is pulling, with the tension held at the bar's centre.
// The zone it is reeled in lies just to its right.
export const props = { gameText: ENGLISH_GAME_TEXT, view: { tension: 50, zone: { start: 49, width: 16 } } };
