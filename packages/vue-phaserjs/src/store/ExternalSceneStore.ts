import type { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import type { ListenersMap } from "#src/models/lifecycle/ListenersMap";

export const ExternalSceneStore = {
  lifecycleListenersMap: new Map<Lifecycle, ListenersMap>(),
  sceneReadyMap: new Map<string, boolean>(),
};
