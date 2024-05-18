import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";

export const getObjectLayer = (layerName: string) => ExternalWorldSceneStore.tilemap.getObjectLayer(layerName);
