import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const TIGHNARI_CHARACTER_ID = 10_000_069;

// Tighnari's behaviour: none of his own, since his strikes, fully charged shot, plunges, Vijnana-Phala Mine and Tanglevine
// Shaft with its Secondary Tanglevine Shaft are his record's alone. Vijnana Suffusion's Wreath Arrow, which turns the
// Charged shot into a shot of its own, is not built: the kit offers no charged variant yet. His passives and constellations
// Are not built either, as they wait on the passive hook
export const createTighnariKitBehaviour = (): KitBehaviour => ({});
