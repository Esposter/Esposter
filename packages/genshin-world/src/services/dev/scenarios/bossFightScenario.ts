import type { DevScenario } from "#src/models/dev/DevScenario";

// Heals the team, then lands ten units east of the Primo Geovishap in Minlin's camp, read from the region data
export const bossFightScenario: DevScenario = { lines: ["heal", "teleport -1673.56 0 -2752.32"], name: "boss-fight" };
