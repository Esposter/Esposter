import type { ElementalNode } from "#src/models/elementalNode/ElementalNode";

import { ELEMENTAL_NODE_PULSE_SECONDS } from "#src/services/elementalNode/constants";

// Advances a node's clock by the seconds given, and returns how many of its pulses fell due, a long step passing more
// Than one
export const stepElementalNode = (node: ElementalNode, seconds: number): number => {
  node.secondsUntilPulse -= seconds;
  let pulses = 0;
  while (node.secondsUntilPulse <= 0) {
    pulses += 1;
    node.secondsUntilPulse += ELEMENTAL_NODE_PULSE_SECONDS;
  }
  return pulses;
};
