import type { BurstColors } from "#src/models/hud/BurstColors";

import { Element } from "#src/models/Element";

// The burst button's tones for each element. Measured on `world-pickup.mkv`: the Anemo fill's bright tone, solved as the
// One colour at a third that turns the backdrop under the mobile client's burst into its fill both over green grass (70 s,
// #1d6c3f to #309d6b) and over blue water (80 s, #449be2 to #47bcea), and the Cryo and Geo discs charged in the PC
// Client's keys layout (4 and 60 s), each read inside the disc clear of its icon and on its ring. Provisional: the Anemo
// Charged disc and every tone of the other four elements, each charged disc the game's own hue for the element
// (`ElementSightColorMap`), which the Geo disc matches, and each bright tone that hue at 1.3 times, as the measured
// Bright tones stand to their charged discs
export const ElementBurstColorsMap: Readonly<Record<Element, BurstColors>> = {
  [Element.Anemo]: { bright: "#50ffe1", charged: "#33ccb3" },
  [Element.Cryo]: { bright: "#85f0ff", charged: "#5eb0dc" },
  [Element.Dendro]: { bright: "#a0ea3b", charged: "#7bb42d" },
  [Element.Electro]: { bright: "#ff9aff", charged: "#d376f0" },
  [Element.Geo]: { bright: "#fec325", charged: "#dd9c1a" },
  [Element.Hydro]: { bright: "#2494ff", charged: "#1c72fd" },
  [Element.Pyro]: { bright: "#ff4026", charged: "#e2311d" },
};
