// How long the game takes to write out each character of a line, a space taking none: three lines of the English
// Client at 60 frames a second, the capture yt-9I7XyJ2Z5RI-dialogue-npc-60.mp4, write 1.79 to 1.81 frames a character
export const TALK_REVEAL_MS_PER_CHARACTER = 30;
// Provisional: how long auto-play holds a whole line that has no voice before it goes on, until a published clip with
// Auto-play on times it, the one the reveal is timed off going on by the player's press
export const TALK_AUTO_PLAY_HOLD_MS = 1500;
// The reply a resident's talk offers a duel of the card game with, which no talk line holds: choosing it leaves the talk
// For the duel instead of going on down a branch
export const DIALOGUE_DUEL_CHOICE_ID = "duel";
