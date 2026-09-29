import { UiStyle } from "../app/models/ui/UiStyle";
import { UiStyleToken } from "../app/models/ui/UiStyleToken";

const PIXEL_FACE = "VT323, monospace";
const SANS_FACE = "Inter, ui-sans-serif, system-ui, sans-serif";
// The game's own face for a reader who has it, then Asap, the open face nearest it (the world package's
// `GAME_FONT_FAMILY` says how it was picked)
const GAME_FACE = '"HYWenHei 85W", "HYWenHei-85W", Asap, ui-sans-serif, system-ui, sans-serif';
const MONO_FACE = '"JetBrains Mono", ui-monospace, monospace';
// A ring one step out on each side, which leaves the corners notched, and a faint lit line along the top
const VOXEL_FRAME_SHADOW = [
  "0 calc(var(--ui-step) * -1) 0 0 var(--ui-border)",
  "0 var(--ui-step) 0 0 var(--ui-border)",
  "calc(var(--ui-step) * -1) 0 0 0 var(--ui-border)",
  "var(--ui-step) 0 0 0 var(--ui-border)",
  "inset 0 var(--ui-step) 0 0 color-mix(in srgb, var(--ui-text) 8%, transparent)",
].join(", ");
// A state layer, Material's: the content's own colour laid over the fill at a fixed strength per state. An unregistered
// Custom property is substituted where it is read, so `currentColor` is the colour of whatever wears it
const getStateLayer = (percentage: number) =>
  `linear-gradient(color-mix(in srgb, currentColor ${percentage}%, transparent) 0 0)`;
// How much of the accent standard's tonal button mixes over whatever it sits on. The palette test composes the same
// Mix over every surface to hold its label at AA
export const STANDARD_TONAL_MIX_PERCENTAGE = 12;
// The style a reader with no cookie gets
export const DEFAULT_UI_STYLE = UiStyle.Standard;
// Each design style's value for every style token. `uno.config.ts` writes a style's column as one rule on its
// `data-ui-style` value, so the tokens are static CSS, and a value may read the palette's tokens and the step but
// Never set a length the layout reads. Voxel draws with hard-edged shadows in the edge colour and never a radius or a
// Blur: a frame is ringed one step out on each side, which leaves its corners notched, with a faint lit line along its
// Top; a raised block is lit along its top and left and shaded along the others; a field is a tone off its surface,
// Set into its surface. One pixel face and one weight, headings in the accent so hierarchy survives a reader who scales the text.
// Standard draws in tones rather than lines, as Material 3 does at the app's density: a frame is a tone above the
// Background with no edge, what floats is a tone further with a wide soft shadow and a faint ring, a field a filled tone
// And a button a tonal one of the accent, each state a layer of the content's colour. A container rounds more than
// The controls inside it, a search field is a pill, and a sans face draws the interface with a mono for code, headings
// In the text colour at a heavier weight.
// Genshin draws as the game's menus do: capsule buttons and fields, rounded panels whose edge is a thin gold line set
// Just inside it, soft shadows under what floats, a rounded humanist face with gold headings, and a loading row of
// Gems that light one by one
export const UiStyleMap = {
  [UiStyle.Genshin]: {
    [UiStyleToken.BlockOpacity]: "1",
    [UiStyleToken.BorderWidth]: "0.0625rem",
    [UiStyleToken.ContainerRadius]: "calc(var(--ui-step) * 3)",
    [UiStyleToken.ControlRadius]: "calc(infinity * 1rem)",
    [UiStyleToken.FocusWidth]: "calc(var(--ui-step) / 2)",
    [UiStyleToken.FontBody]: GAME_FACE,
    [UiStyleToken.FontHeading]: GAME_FACE,
    [UiStyleToken.FontMono]: MONO_FACE,
    // The gold line a step inside the edge, over a band of the panel's own colour, and a soft shadow beneath
    [UiStyleToken.FrameShadow]: [
      "inset 0 0 0 var(--ui-step) var(--ui-panel)",
      "inset 0 0 0 calc(var(--ui-step) + var(--ui-border-width)) color-mix(in srgb, var(--ui-accent) 55%, transparent)",
      "0 calc(var(--ui-step) / 2) calc(var(--ui-step) * 3) rgb(0 0 0 / 0.18)",
    ].join(", "),
    [UiStyleToken.HeadingColor]: "var(--ui-accent)",
    [UiStyleToken.HoverFilter]: "none",
    [UiStyleToken.HoverOverlay]: getStateLayer(8),
    [UiStyleToken.IndicatorWidth]: "calc(var(--ui-border-width) * 2)",
    [UiStyleToken.LiftedShadow]: [
      "inset 0 0 0 var(--ui-step) var(--ui-lifted)",
      "inset 0 0 0 calc(var(--ui-step) + var(--ui-border-width)) color-mix(in srgb, var(--ui-accent) 55%, transparent)",
      "0 calc(var(--ui-step) * 3) calc(var(--ui-step) * 10) rgb(0 0 0 / 0.3)",
    ].join(", "),
    [UiStyleToken.LineFill]: "var(--ui-accent)",
    [UiStyleToken.LineSnap]: "0.0625rem",
    [UiStyleToken.PillRadius]: "calc(infinity * 1rem)",
    [UiStyleToken.PressedOverlay]: getStateLayer(12),
    [UiStyleToken.RaisedBackground]: `color-mix(in srgb, var(--ui-accent) ${STANDARD_TONAL_MIX_PERCENTAGE}%, transparent)`,
    [UiStyleToken.RaisedColor]: "var(--ui-accent)",
    // A faint gold ring around each capsule
    [UiStyleToken.RaisedShadow]:
      "inset 0 0 0 var(--ui-border-width) color-mix(in srgb, var(--ui-accent) 40%, transparent)",
    [UiStyleToken.Scrim]: "var(--ui-background)",
    [UiStyleToken.TextBody]: "0.9375rem",
    [UiStyleToken.TextDisplay]: "2.5rem",
    [UiStyleToken.TextHeading]: "1.0625rem",
    [UiStyleToken.TextTitle]: "1.5rem",
    [UiStyleToken.Tint]: "color-mix(in srgb, var(--ui-accent) 70%, transparent)",
    [UiStyleToken.WeightHeading]: "700",
  },
  [UiStyle.Standard]: {
    // A bar's blocks are kept for the layout, and the row drawn as one rounded track instead, filled to the exact reading
    [UiStyleToken.BlockOpacity]: "0",
    [UiStyleToken.BorderWidth]: "0.0625rem",
    [UiStyleToken.ContainerRadius]: "calc(var(--ui-step) * 2)",
    [UiStyleToken.ControlRadius]: "var(--ui-step)",
    [UiStyleToken.FocusWidth]: "calc(var(--ui-step) / 2)",
    [UiStyleToken.FontBody]: SANS_FACE,
    [UiStyleToken.FontHeading]: SANS_FACE,
    [UiStyleToken.FontMono]: MONO_FACE,
    [UiStyleToken.FrameShadow]: "none",
    [UiStyleToken.HeadingColor]: "var(--ui-text)",
    [UiStyleToken.HoverFilter]: "none",
    [UiStyleToken.HoverOverlay]: getStateLayer(8),
    // The line under the selected tab: two hairlines of the accent
    [UiStyleToken.IndicatorWidth]: "calc(var(--ui-border-width) * 2)",
    [UiStyleToken.LiftedShadow]: [
      "0 0 0 var(--ui-border-width) color-mix(in srgb, var(--ui-text) 8%, transparent)",
      "0 calc(var(--ui-step) * 3) calc(var(--ui-step) * 10) rgb(0 0 0 / 0.24)",
    ].join(", "),
    [UiStyleToken.LineFill]: "var(--ui-accent)",
    // Continuous: a length finer than the line can show
    [UiStyleToken.LineSnap]: "0.0625rem",
    [UiStyleToken.PillRadius]: "calc(infinity * 1rem)",
    [UiStyleToken.PressedOverlay]: getStateLayer(12),
    [UiStyleToken.RaisedBackground]: `color-mix(in srgb, var(--ui-accent) ${STANDARD_TONAL_MIX_PERCENTAGE}%, transparent)`,
    [UiStyleToken.RaisedColor]: "var(--ui-accent)",
    [UiStyleToken.RaisedShadow]: "none",
    // The background, translucent through the scrim's own opacity
    [UiStyleToken.Scrim]: "var(--ui-background)",
    [UiStyleToken.TextBody]: "0.875rem",
    [UiStyleToken.TextDisplay]: "2.25rem",
    [UiStyleToken.TextHeading]: "1rem",
    [UiStyleToken.TextTitle]: "1.375rem",
    // A hovered or highlighted row is tinted in the accent at a lower strength than voxel's, so what is chosen still
    // Reads above what is only pointed at
    [UiStyleToken.Tint]: "color-mix(in srgb, var(--ui-accent) 70%, transparent)",
    [UiStyleToken.WeightHeading]: "600",
  },
  [UiStyle.Voxel]: {
    [UiStyleToken.BlockOpacity]: "1",
    [UiStyleToken.BorderWidth]: "var(--ui-step)",
    [UiStyleToken.ContainerRadius]: "0",
    [UiStyleToken.ControlRadius]: "0",
    [UiStyleToken.FocusWidth]: "var(--ui-step)",
    [UiStyleToken.FontBody]: PIXEL_FACE,
    [UiStyleToken.FontHeading]: PIXEL_FACE,
    [UiStyleToken.FontMono]: PIXEL_FACE,
    [UiStyleToken.FrameShadow]: VOXEL_FRAME_SHADOW,
    [UiStyleToken.HeadingColor]: "var(--ui-accent)",
    [UiStyleToken.HoverFilter]: "brightness(1.25)",
    [UiStyleToken.HoverOverlay]: "none",
    // Its bottom shade, lit
    [UiStyleToken.IndicatorWidth]: "calc(var(--ui-step) / 2)",
    // What floats is ringed as a frame is, since a blur is not voxel's
    [UiStyleToken.LiftedShadow]: VOXEL_FRAME_SHADOW,
    // Blocks four steps long a step apart, the loading bar's own, grown a whole block at a time
    [UiStyleToken.LineFill]:
      "repeating-linear-gradient(to right, var(--ui-accent) 0 calc(var(--ui-step) * 4), transparent 0 calc(var(--ui-step) * 5))",
    [UiStyleToken.LineSnap]: "calc(var(--ui-step) * 5)",
    [UiStyleToken.PillRadius]: "0",
    [UiStyleToken.PressedOverlay]: "none",
    [UiStyleToken.RaisedBackground]: "var(--ui-border)",
    [UiStyleToken.RaisedColor]: "var(--ui-text)",
    [UiStyleToken.RaisedShadow]: [
      "inset calc(var(--ui-step) / -2) calc(var(--ui-step) / -2) 0 0 color-mix(in srgb, var(--ui-background) 45%, transparent)",
      "inset calc(var(--ui-step) / 2) calc(var(--ui-step) / 2) 0 0 color-mix(in srgb, var(--ui-text) 20%, transparent)",
    ].join(", "),
    // A dither, a checker of the background colour, rather than a blurred wash
    [UiStyleToken.Scrim]:
      "repeating-conic-gradient(var(--ui-background) 0 25%, transparent 0 50%) 0 0 / calc(var(--ui-step) * 2) calc(var(--ui-step) * 2)",
    // The type scale, each a whole number of steps: body, a section heading, a page title and a landing page's display
    [UiStyleToken.TextBody]: "calc(var(--ui-step) * 5)",
    [UiStyleToken.TextDisplay]: "calc(var(--ui-step) * 12)",
    [UiStyleToken.TextHeading]: "calc(var(--ui-step) * 6)",
    [UiStyleToken.TextTitle]: "calc(var(--ui-step) * 8)",
    [UiStyleToken.Tint]: "var(--ui-accent)",
    [UiStyleToken.WeightHeading]: "normal",
  },
} as const satisfies Record<UiStyle, Record<UiStyleToken, string>>;
