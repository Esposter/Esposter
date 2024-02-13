import { type TiledObjectProperty } from "@/models/dungeons/tile/TiledObjectProperty";
import { SignObjectProperty } from "@/models/dungeons/world/home/SignObjectProperty";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";

export const useInteractWithSign = () => {
  const worldSceneStore = useWorldSceneStore();
  const { signLayer } = storeToRefs(worldSceneStore);
  const interactiveObject = useReadInteractiveObject(signLayer.value, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!interactiveObject) return;

  const messageTiledObjectProperty = (interactiveObject.properties as TiledObjectProperty<string>[]).find(
    (p) => p.name === SignObjectProperty.message,
  );
  if (!messageTiledObjectProperty) return;
};
