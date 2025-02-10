import type { TeleportTarget } from "#shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import { TeleportObjectProperty } from "#shared/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { phaserEventEmitter } from "@/services/phaser/events";
import { usePlayerStore } from "@/store/dungeons/player";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { NotFoundError } from "@esposter/shared";
import { Cameras } from "phaser";
import { useCameraStore } from "vue-phaserjs";

export const doorInteractionEffect: Effect = (scene, teleportObjects) => {
  const teleportObject = useGetInteractiveObject(teleportObjects);
  if (!teleportObject) return false;

  const teleportTargetTiledObjectProperty = getTiledObjectProperty<TeleportTarget>(
    teleportObject.properties,
    TeleportObjectProperty.target,
  );
  const cameraStore = useCameraStore();
  const { fadeIn, fadeOut } = cameraStore;
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  fadeOut(scene);
  getDungeonsSoundEffect(scene, FileKey.SoundOpenDoor).play();
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, async () => {
    await switchToTilemap(teleportTargetTiledObjectProperty.value.tilemapKey);

    const doorObjectLayer = ExternalWorldSceneStore.objectLayerMap.get(ObjectgroupName.Door);
    if (!doorObjectLayer)
      throw new NotFoundError(doorInteractionEffect.name, teleportTargetTiledObjectProperty.value.tilemapKey);

    const doorObjects = getObjects(doorObjectLayer);
    for (const { properties, x, y } of doorObjects) {
      const idTiledObjectProperty = getTiledObjectProperty<TeleportTarget["id"]>(properties, TeleportObjectProperty.id);
      if (idTiledObjectProperty.value !== teleportTargetTiledObjectProperty.value.id) continue;

      const playerStore = usePlayerStore();
      const { player } = storeToRefs(playerStore);
      phaserEventEmitter.emit("playerTeleport", getPositionAfterDirectionMovement({ x, y }, player.value.direction));
    }

    fadeIn(scene);
  });
  return true;
};
