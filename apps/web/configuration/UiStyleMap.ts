import { UiStyle } from "../app/models/ui/UiStyle";
import { UiStyleToken } from "../app/models/ui/UiStyleToken";

const PIXEL_FACE = "VT323, monospace";
// Each design style's value for every style token. `uno.config.ts` writes a style's column as one rule on its
// `data-ui-style` value, so the tokens are static CSS, and a value may read the palette's tokens and the step but
// Never set a length the layout reads. Voxel draws with hard-edged shadows in the edge colour and never a radius or a
// Blur: a frame is ringed one step out on each side, which leaves its corners notched, with a faint lit line along its
// Top; a raised block is lit along its top and left and shaded along the others; a sunk field is shaded along its
// Bottom. One pixel face and one weight, headings in the accent so hierarchy survives a reader who scales the text
export const UiStyleMap = {
  [UiStyle.Voxel]: {
    [UiStyleToken.BorderWidth]: "var(--ui-step)",
    [UiStyleToken.FocusWidth]: "var(--ui-step)",
    [UiStyleToken.FontBody]: PIXEL_FACE,
    [UiStyleToken.FontHeading]: PIXEL_FACE,
    [UiStyleToken.FontMono]: PIXEL_FACE,
    [UiStyleToken.FrameShadow]: [
      "0 calc(var(--ui-step) * -1) 0 0 var(--ui-border)",
      "0 var(--ui-step) 0 0 var(--ui-border)",
      "calc(var(--ui-step) * -1) 0 0 0 var(--ui-border)",
      "var(--ui-step) 0 0 0 var(--ui-border)",
      "inset 0 var(--ui-step) 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent)",
    ].join(", "),
    [UiStyleToken.HeadingColor]: "var(--ui-accent)",
    [UiStyleToken.HoverFilter]: "brightness(1.25)",
    [UiStyleToken.Radius]: "0",
    [UiStyleToken.RaisedBackground]: "var(--ui-border)",
    [UiStyleToken.RaisedShadow]: [
      "inset calc(var(--ui-step) / -2) calc(var(--ui-step) / -2) 0 0 color-mix(in srgb, var(--ui-background) 45%, transparent)",
      "inset calc(var(--ui-step) / 2) calc(var(--ui-step) / 2) 0 0 color-mix(in srgb, var(--ui-text) 20%, transparent)",
    ].join(", "),
    // A dither, a checker of the background colour, rather than a blurred wash
    [UiStyleToken.Scrim]:
      "repeating-conic-gradient(var(--ui-background) 0 25%, transparent 0 50%) 0 0 / calc(var(--ui-step) * 2) calc(var(--ui-step) * 2)",
    [UiStyleToken.SunkShadow]: "inset 0 calc(var(--ui-step) / -2) 0 0 var(--ui-border)",
    // The type scale, each a whole number of steps: body, a section heading, a page title and a landing page's display
    [UiStyleToken.TextBody]: "calc(var(--ui-step) * 5)",
    [UiStyleToken.TextDisplay]: "calc(var(--ui-step) * 12)",
    [UiStyleToken.TextHeading]: "calc(var(--ui-step) * 6)",
    [UiStyleToken.TextTitle]: "calc(var(--ui-step) * 8)",
    [UiStyleToken.WeightHeading]: "normal",
  },
} as const satisfies Record<UiStyle, Record<UiStyleToken, string>>;
