import type { PositionalArgDef } from "citty";

// A screen on the parity page and the size it is drawn at, as every command showing one takes it
export const screenArgs: {
  height: PositionalArgDef;
  screen: PositionalArgDef & { required: true };
  width: PositionalArgDef;
} = {
  screen: { description: "A screen with a fixture on the parity page", required: true, type: "positional" },
  width: { default: "1920", description: "Width to draw it at, in pixels", required: false, type: "positional" },
  height: { default: "1080", description: "Height to draw it at, in pixels", required: false, type: "positional" },
};
