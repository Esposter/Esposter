// Provisional best estimate, on the roadmap's Manual verification: how far from the body a thing can be acted on, in
// Metres. No published clip walks slowly up to a lone thing where its distance can be solved
export const INTERACTION_REACH = 2.5;
// Provisional best estimate, on the roadmap's Manual verification: how many rows the prompt list shows at once. No
// Published clip or wiki still shows a pile of more things than the list holds
export const INTERACTION_WINDOW_SIZE = 5;
// How often a held F picks up again, in seconds: three pick ups by F, each 27 frames at 60 a second after the last, in a
// Published PC clip of the English client, `captures/world-pickup.mkv` from 38.5 to 39.6 seconds. Whether F is held
// There rather than tapped is on the roadmap's Manual verification
export const INTERACTION_HELD_REPEAT_SECONDS = 0.45;
// The radius of a drop's stand-in sphere, in metres
export const DROP_STAND_IN_RADIUS = 0.15;
// How many drops and how many residents the world draws stand-ins for at once, one instanced mesh of each kind
export const INTERACTABLE_CAPACITY = 64;
// The stand-ins' tints, until the drops and the residents are drawn as the game draws them
export const DROP_STAND_IN_COLOR = 0xf2_d0_6b;
export const RESIDENT_STAND_IN_COLOR = 0x8f_b8_e0;
