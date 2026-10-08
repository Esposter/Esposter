// Provisional: how far from the body a thing can be acted on, in metres, until the passes' recording of a pick up
// Measures the game's reach
export const INTERACTION_REACH = 2.5;
// Provisional: how many rows the prompt list shows at once, until the passes' recording of a pile of drops counts them
export const INTERACTION_WINDOW_SIZE = 5;
// Provisional: how often a held F picks up again, in seconds, until a recording of the game's held pick up measures it
export const INTERACTION_HELD_REPEAT_SECONDS = 0.15;
// The radius of a drop's stand-in sphere, in metres
export const DROP_STAND_IN_RADIUS = 0.15;
// How many drops and how many residents the world draws stand-ins for at once, one instanced mesh of each kind
export const INTERACTABLE_CAPACITY = 64;
// The stand-ins' tints, until the drops and the residents are drawn as the game draws them
export const DROP_STAND_IN_COLOR = 0xf2_d0_6b;
export const RESIDENT_STAND_IN_COLOR = 0x8f_b8_e0;
