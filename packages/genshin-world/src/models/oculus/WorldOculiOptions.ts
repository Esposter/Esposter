import type { MapCamera } from "#src/models/map/MapCamera";
import type { GroundPoint } from "genshin-engine";
import type { ShallowRef } from "vue";

// What the Oculi are read and marked against: the Oculi the player has found, the body that touches one and the camera the
// Minimap marks those near it from, and where the published places are read from
export interface WorldOculiOptions {
  characterBody: { position: GroundPoint };
  foundOculusIds: Readonly<ShallowRef<ReadonlySet<string>>>;
  getMapCamera: () => MapCamera;
}
