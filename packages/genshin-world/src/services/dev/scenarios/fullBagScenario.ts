import type { DevScenario } from "#src/models/dev/DevScenario";

// Gives the wallet's Mora and Primogems and the materials whose stack holds 99,999, each named by one word only it holds
export const fullBagScenario: DevScenario = {
  lines: [
    "give Mora 99999",
    "give Primogem 99999",
    "give Starsilver 99999",
    "give Lump 99999",
    "give Condessence 99999",
    "give Rainbowdrop 99999",
    "give Sanctifying 99999",
  ],
  name: "full-bag",
};
