import { TeleportObjectProperty } from "@/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import type { TeleportTarget } from "@/generated/tiled/propertyTypes/class/TeleportTarget";
import { useCameraStore } from "@/lib/phaser/store/camera";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
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
  scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    tilemapKey.value = teleportTargetTiledObjectProperty.value.tilemapKey;
    fadeIn(scene);
  });
  return true;
};
