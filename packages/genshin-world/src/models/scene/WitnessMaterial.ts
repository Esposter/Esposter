import type { StoneNodeMaterial, ToonNodeMaterial } from "genshin-engine";

// What a host lights the game's exported materials with, each laid over one of its own: the login's stone, lit by the
// Game's deferred pass, or the world's toon material, lit by the ramp as our stand-ins are
export type WitnessMaterial = StoneNodeMaterial | ToonNodeMaterial;
