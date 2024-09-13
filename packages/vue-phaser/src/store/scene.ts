import type { Lifecycle } from "@/models/lifecycle/Lifecycle";
import type { ListenersMap } from "@/models/lifecycle/ListenersMap";

export const ExternalSceneStore = {
  lifecycleListenersMap: new Map<Lifecycle, ListenersMap>(),
  sceneReadyMap: new Map<string, boolean>(),
};
