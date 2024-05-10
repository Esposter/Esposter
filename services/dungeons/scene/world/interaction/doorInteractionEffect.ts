import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { TeleportObjectProperty } from "@/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import type { TeleportTarget } from "@/generated/tiled/propertyTypes/class/TeleportTarget";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { useCameraStore } from "@/lib/phaser/store/camera";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { NotFoundError } from "@/models/error/NotFoundError";
import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { usePlayerStore } from "@/store/dungeons/player";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Cameras } from "phaser";

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
  const { tilemapKey } = storeToRefs(worldSceneStore);
  fadeOut(scene);
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, async () => {
    tilemapKey.value = teleportTargetTiledObjectProperty.value.tilemapKey;
    // Wait until vue's tilemap key watcher has loaded the new tilemap
    await nextTick();
    const doorObjectLayer = ExternalWorldSceneStore.objectLayerMap.get(ObjectgroupName.Door);
    if (!doorObjectLayer)
      throw new NotFoundError(doorInteractionEffect.name, teleportTargetTiledObjectProperty.value.tilemapKey);

    const doorObjects = getObjects(doorObjectLayer);
    for (const { x, y, properties } of doorObjects) {
      const idTiledObjectProperty = getTiledObjectProperty<TeleportTarget["id"]>(properties, TeleportObjectProperty.id);
      if (idTiledObjectProperty.value !== teleportTargetTiledObjectProperty.value.id) continue;

      const playerStore = usePlayerStore();
      const { player } = storeToRefs(playerStore);
      phaserEventEmitter.emit("teleport", getPositionAfterDirectionMovement({ x, y }, player.value.direction));
    }

    fadeIn(scene);
  });
  return true;
};
