import type { SceneMaterial } from "#src/scene/SceneMaterial";
import type { ScenePlacement } from "#src/scene/ScenePlacement";

// A scene as its parts laid out: every placement, and every material they draw with by its key. A witness render
// Draws one written from the game's exports, whose meshes and textures are named by their exported files
// (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export interface SceneLayout {
  materials: Record<string, SceneMaterial>;
  placements: ScenePlacement[];
}
