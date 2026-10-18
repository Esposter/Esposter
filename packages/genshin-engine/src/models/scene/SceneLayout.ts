import type { SceneMaterial } from "#src/models/scene/SceneMaterial";
import type { ScenePlacement } from "#src/models/scene/ScenePlacement";

// A scene as its parts laid out: every placement, and every material they draw with by its key. A witness render
// Draws one written from the game's exports, whose meshes and textures are named by their exported files
// (openspec/specs/genshin/scene-derivation/design.md)
export interface SceneLayout {
  materials: Record<string, SceneMaterial>;
  placements: ScenePlacement[];
}
