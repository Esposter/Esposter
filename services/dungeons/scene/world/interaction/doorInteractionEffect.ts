import { TeleportObjectProperty } from "@/generated/tiled/propertyTypes/class/TeleportObjectProperty";
import type { TeleportTarget } from "@/generated/tiled/propertyTypes/class/TeleportTarget";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const doorInteractionEffect: Effect = (_scene, teleportObjects) => {
  const teleportObject = useGetInteractiveObject(teleportObjects);
  if (!teleportObject) return false;

  const teleportTargetTiledObjectProperty = getTiledObjectProperty<TeleportTarget>(
    teleportObject.properties,
    TeleportObjectProperty.target,
  );
  const worldSceneStore = useWorldSceneStore();
  const { tilemapKey } = storeToRefs(worldSceneStore);
  tilemapKey.value = teleportTargetTiledObjectProperty.value.tilemapKey;
  return true;
};
