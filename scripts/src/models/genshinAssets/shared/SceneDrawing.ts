import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

// What one game object draws: its mesh by name (or by path ID where the dump names it no other way), the materials it
// Draws it with by path ID, one a submesh, and the pointers to both as the dump holds them, which the closure resolves
export interface SceneDrawing {
  materials: string[];
  mesh: string;
  pointers: ObjectPointer[];
}
