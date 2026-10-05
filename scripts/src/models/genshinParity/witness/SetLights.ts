import type { SceneLights } from "genshin-world/parity/models/SceneLights";
import type { SceneLightShares } from "genshin-world/parity/models/SceneLightShares";

// The page's `setSceneLights` as the tooling calls it, the scene already bound
export type SetLights = (shares: SceneLightShares) => SceneLights;
