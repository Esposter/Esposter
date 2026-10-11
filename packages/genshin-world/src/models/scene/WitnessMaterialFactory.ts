import type { WitnessMaterial } from "#src/models/scene/WitnessMaterial";
import type { SceneMaterial } from "genshin-engine";

// The host's material an exported material is laid over, made for each exported material by what it records, so a host
// Can draw a shader's parts as its own of the same kind: the leaf cards in its wind
export type WitnessMaterialFactory = (sceneMaterial: SceneMaterial) => WitnessMaterial;
