import type { Element } from "#src/models/Element";

// An Elemental Node in the world: the element it pulses into the enemies in its reach, and the seconds left until its
// Next pulse
export interface ElementalNode {
  element: Element;
  secondsUntilPulse: number;
}
