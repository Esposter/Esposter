import type { setSceneCloudLayer } from "genshin-world/parity/setSceneCloudLayer";

// The parity page's setter of its scene's cloud layer, as the window holds it
export type SetCloudLayer = (layer: Parameters<typeof setSceneCloudLayer>[1]) => Promise<void>;
