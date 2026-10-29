import type { CSSProperties } from "vue";

// The game's screen is this many pixels wide, and the box a screen is mounted in is that wide at the window's height
export const SCREEN_BOX_WIDTH = 1920;

// The style of the box a screen is mounted in `left` pixels from the window's left edge, the parity page's and the visual
// Suite's alike: a unit is the window's pixel, as the game draws its interface at the window's height
export const getScreenBoxStyle = (left: number): CSSProperties => ({
  height: "100%",
  left: `${left}px`,
  position: "absolute",
  top: 0,
  width: `${SCREEN_BOX_WIDTH}px`,
});
