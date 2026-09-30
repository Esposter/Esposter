import { InterfaceIcon } from "#src/models/InterfaceIcon";

// Each glyph's ink box's middle on its 48 unit square, which the button centres: the game trims each icon's sprite to
// Its ink and centres it on its button (`UI_IconSmall_*` in 11790361, every one centred in its own box), where each
// Trace's square was set by the crop it was traced from, up to two and a half units off
export const InterfaceIconCentreMap: Record<InterfaceIcon, [number, number]> = {
  [InterfaceIcon.Exit]: [26.6, 24.75],
  [InterfaceIcon.Notice]: [24, 25.8],
  [InterfaceIcon.Power]: [25.5, 23.75],
  [InterfaceIcon.Repair]: [24, 26],
  [InterfaceIcon.Settings]: [23.95, 25],
};
