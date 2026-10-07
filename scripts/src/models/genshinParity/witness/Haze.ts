import type { SceneFog } from "genshin-world/parity/models/SceneFog";

// The haze's profile a solve refines: its density, how fast it thins with height and the most it ever hides
export type Haze = Pick<SceneFog, "density" | "heightFalloff" | "maxOpacity">;
