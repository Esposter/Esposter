import type { WaterFlow } from "#src/models/water/WaterFlow";

import { Vector2 } from "three";
import { uniform } from "three/tsl";

// Still water flows nowhere, so its surface is carried by zero
export const createWaterFlowUniforms = (): WaterFlow => ({ direction: uniform(new Vector2()), speed: uniform(0) });
