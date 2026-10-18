// The seconds between a node's pulses, and the gauge of its element each pulse lays on an enemy in reach: the full gauge
// On an enemy without the buff, and on one with it the buffed gauge more, up to the buff's most
export const ELEMENTAL_NODE_PULSE_SECONDS = 15;
export const ELEMENTAL_NODE_PULSE_GAUGE = 3.6;
export const ELEMENTAL_NODE_BUFFED_PULSE_GAUGE = 1.2;
export const ELEMENTAL_NODE_MAX_GAUGE = 3.6;
// The pulses an enemy waits after a reaction depletes its buff before the buff can return
export const ELEMENTAL_NODE_COOLDOWN_PULSES = 2;
// The RES a buffed enemy gains, a negative reduction, to every element and to physical hits, and the extra it gains to
// The node's own element
export const ELEMENTAL_NODE_RESISTANCE_REDUCTION = -0.5;
export const ELEMENTAL_NODE_ELEMENT_RESISTANCE_REDUCTION = -0.5;
// The source a node's buff is recorded under, since a node is no combatant and takes no character's id
export const ELEMENTAL_NODE_SOURCE_ID = 0;
export const ELEMENTAL_NODE_STATUS_ID = "elementalNode";
