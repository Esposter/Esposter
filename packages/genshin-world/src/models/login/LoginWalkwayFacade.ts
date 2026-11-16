import type { LoginWalkwayPiece } from "#src/models/login/LoginWalkwayPiece";
import type { BatchedMesh } from "three";

// The login walkway's one batched draw: the batch, the pieces its copies are laid from, the placing of each copy on the
// Glide, and the release of its geometry, batch and material
export interface LoginWalkwayFacade {
  batch: BatchedMesh;
  dispose: () => void;
  pieces: LoginWalkwayPiece[];
  update: (
    walkwayScrolled: number,
    { cameraZ, doorAheadOfCamera }: { cameraZ: number; doorAheadOfCamera?: number | undefined },
  ) => void;
}
