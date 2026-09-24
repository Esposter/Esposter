import { UiStyle } from "../app/models/ui/UiStyle";
import { UiStyleToken } from "../app/models/ui/UiStyleToken";

const PIXEL_FACE = "VT323, monospace";
const SANS_FACE = "Inter, ui-sans-serif, system-ui, sans-serif";
// A hairline, inset into the box so it takes none of the room the layout sized
const HAIRLINE = "inset 0 0 0 var(--ui-border-width) var(--ui-border)";
const getOverlay = (percentage: number) =>
  `linear-gradient(color-mix(in srgb, var(--ui-text) ${percentage}%, transparent) 0 0)`;
// The style a reader with no cookie gets, and the one Vuetify's themes are built in before the first selection
export const DEFAULT_UI_STYLE = UiStyle.Voxel;
// Each design style's value for every style token. `uno.config.ts` writes a style's column as one rule on its
// `data-ui-style` value, so the tokens are static CSS, and a value may read the palette's tokens and the step but
// Never set a length the layout reads. Voxel draws with hard-edged shadows in the edge colour and never a radius or a
// Blur: a frame is ringed one step out on each side, which leaves its corners notched, with a faint lit line along its
// Top; a raised block is lit along its top and left and shaded along the others; a sunk field is shaded along its
// Bottom. One pixel face and one weight, headings in the accent so hierarchy survives a reader who scales the text.
// Standard is the look most shipped products settled on, its values taken from Nuxt UI's tokens and Radix's scale: a
// Hairline edge and one small radius, flat fills that an overlay of the text colour darkens or lightens, a sans face for
// The interface and a mono for code, headings in the text colour at a heavier weight
export const UiStyleMap = {
  [UiStyle.Standard]: {
    // The blocks of a bar are joined into one track, which draws the edge for all of them
    [UiStyleToken.BlockShadow]: "none",
    [UiStyleToken.BorderWidth]: "0.0625rem",
    [UiStyleToken.FocusWidth]: "calc(var(--ui-step) / 2)",
    [UiStyleToken.FontBody]: SANS_FACE,
    [UiStyleToken.FontHeading]: SANS_FACE,
    [UiStyleToken.FontMono]: '"JetBrains Mono", ui-monospace, monospace',
    [UiStyleToken.FrameShadow]: HAIRLINE,
    [UiStyleToken.HeadingColor]: "var(--ui-text)",
    [UiStyleToken.HoverFilter]: "none",
    [UiStyleToken.HoverOverlay]: getOverlay(6),
    // What floats over the page — a popover, a dialog — casts one soft shadow, since a hairline alone reads as flat
    [UiStyleToken.LiftedFilter]: "drop-shadow(0 calc(var(--ui-step) * 2) calc(var(--ui-step) * 4) rgb(0 0 0 / 0.25))",
    [UiStyleToken.PressedOverlay]: getOverlay(12),
    [UiStyleToken.Radius]: "var(--ui-step)",
    [UiStyleToken.RaisedBackground]: "color-mix(in srgb, var(--ui-text) 6%, var(--ui-panel))",
    [UiStyleToken.RaisedShadow]: HAIRLINE,
    // The background, translucent through the scrim's own opacity
    [UiStyleToken.Scrim]: "var(--ui-background)",
    [UiStyleToken.SunkShadow]: HAIRLINE,
    [UiStyleToken.TextBody]: "0.875rem",
    [UiStyleToken.TextDisplay]: "2.25rem",
    [UiStyleToken.TextHeading]: "1rem",
    [UiStyleToken.TextTitle]: "1.375rem",
    // A hovered or highlighted row is tinted in the text colour, so the accent is kept for what is chosen
    [UiStyleToken.Tint]: "var(--ui-text)",
    [UiStyleToken.WeightHeading]: "600",
  },
  [UiStyle.Voxel]: {
    [UiStyleToken.BlockShadow]: "var(--ui-sunk-shadow)",
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
    [UiStyleToken.HoverOverlay]: "none",
    [UiStyleToken.LiftedFilter]: "none",
    [UiStyleToken.PressedOverlay]: "none",
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
    [UiStyleToken.Tint]: "var(--ui-accent)",
    [UiStyleToken.WeightHeading]: "normal",
  },
} as const satisfies Record<UiStyle, Record<UiStyleToken, string>>;
