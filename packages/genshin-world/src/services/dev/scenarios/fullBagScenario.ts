import type { DevScenario } from "#src/models/dev/DevScenario";

// Gives the wallet's Mora and Primogems and the materials whose stack holds 99,999, each named by one word only it holds
export const fullBagScenario: DevScenario = {
  lines: [
    "give 99999 Mora",
    "give 99999 Primogem",
    "give 99999 Starsilver",
    "give 99999 Lump",
    "give 99999 Condessence",
    "give 99999 Rainbowdrop",
    "give 99999 Sanctifying",
  ],
  name: "full-bag",
};
