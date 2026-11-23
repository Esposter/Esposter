import type { TeleportTarget } from "#shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { Effect } from "#src/models/dungeons/scene/world/interaction/Effect";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { TeleportObjectProperty } from "#shared/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import { getPositionAfterDirectionMovement } from "#src/services/dungeons/direction/getPositionAfterDirectionMovement";
import { getDoorPosition } from "#src/services/dungeons/scene/world/interaction/getDoorPosition";
import { getInteractiveObject } from "#src/services/dungeons/scene/world/interaction/getInteractiveObject";
import { getDungeonsSoundEffect } from "#src/services/dungeons/sound/getDungeonsSoundEffect";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { usePlayerStore } from "#src/store/dungeons/player";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { getResultAsync, noop } from "@esposter/shared";
import { Cameras } from "phaser";
import { useCameraStore } from "vue-phaserjs";

export const doorInteractionEffect: Effect = (scene, teleportObjects) => {
  const teleportObject = getInteractiveObject(teleportObjects);
  if (!teleportObject) return false;

  const teleportTargetTiledObjectProperty = getTiledObjectProperty<TeleportTarget>(
    teleportObject.properties,
    TeleportObjectProperty.Target,
  );
  const cameraStore = useCameraStore();
  const { fadeIn, fadeOut } = cameraStore;
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  fadeOut(scene);
  getDungeonsSoundEffect(scene, DungeonsKeys.SoundOpenDoor).play();
  // Phaser's emitter drops the promise an async listener returns, so getResultAsync logs a failed teleport instead
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
    getResultAsync(async () => {
      const { id, tilemapKey } = teleportTargetTiledObjectProperty.value;
      const doorPosition = getDoorPosition(scene, tilemapKey, id);
      const playerPosition = getPositionAfterDirectionMovement(doorPosition, player.value.direction);
      await switchToTilemap(tilemapKey, playerPosition);
      // The position events a teleport emits are what the player's encounter check listens to
      phaserEventEmitter.emit("playerTeleport", playerPosition);

      fadeIn(scene);
    }).match(noop, console.error),
  );
  return true;
};
