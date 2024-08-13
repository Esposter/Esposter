import type { Building } from "@/models/clicker/data/building/Building";
import type { Except } from "type-fest";

import { BuildingId } from "@/models/clicker/data/building/BuildingId";
import { compileVariable } from "@/services/clicker/compiler/compileVariable";

export const BuildingMap = {
  [BuildingId.Bank]: {
    basePrice: 1.4e6,
    baseValue: 1.4e3,
    flavorDescription: `Generates ${compileVariable("pluralName")} from interest.`,
  },
  [BuildingId.Chancemaker]: {
    basePrice: 2.6e16,
    baseValue: 2.1e10,
    flavorDescription: `Generates ${compileVariable("pluralName")} out of thin air through sheer luck.`,
  },
  [BuildingId.Cursor]: {
    basePrice: 15,
    baseValue: 1e-1,
    flavorDescription: "Autoclicks once every 10 seconds.",
  },
  [BuildingId.Factory]: {
    basePrice: 1.3e5,
    baseValue: 2.6e2,
    flavorDescription: `Produces large quantities of ${compileVariable("pluralName")}.`,
  },
  [BuildingId.Farm]: {
    basePrice: 1.1e3,
    baseValue: 8,
    flavorDescription: `Grows ${compileVariable("name")} plants from ${compileVariable("name")} seeds.`,
  },
  [BuildingId.Grandma]: {
    basePrice: 1e2,
    baseValue: 1,
    flavorDescription: `A nice grandma to make more ${compileVariable("pluralName")}.`,
  },
  [BuildingId.Idleverse]: {
    basePrice: 1.2e22,
    baseValue: 8.3e12,
    flavorDescription: `There's been countless other idle universes running alongside our own. You've finally found a way to hijack their production and convert whatever they've been making into ${compileVariable(
      "pluralName",
    )}!`,
  },
  [BuildingId.Mine]: {
    basePrice: 1.2e4,
    baseValue: 47,
    flavorDescription: `Mines out ${compileVariable("pluralName")}.`,
  },
  [BuildingId.Portal]: {
    basePrice: 1e12,
    baseValue: 1e7,
    flavorDescription: `Opens a door to the ${compileVariable("name")}-verse.`,
  },
  [BuildingId.Prism]: {
    basePrice: 2.1e15,
    baseValue: 2.9e9,
    flavorDescription: `Converts light itself into ${compileVariable("pluralName")}.`,
  },
  [BuildingId.Shipment]: {
    basePrice: 5.1e9,
    baseValue: 2.6e5,
    flavorDescription: `Brings in fresh ${compileVariable("pluralName")} from the ${compileVariable("name")} planet.`,
  },
  [BuildingId.Temple]: {
    basePrice: 2e7,
    baseValue: 7.8e3,
    flavorDescription: `Full of precious, ancient ${compileVariable("pluralName")}.`,
  },
  [BuildingId["Alchemy Lab"]]: {
    basePrice: 7.5e10,
    baseValue: 1.6e6,
    flavorDescription: `Turns gold into ${compileVariable("pluralName")}!`,
  },
  [BuildingId["Antimatter Condenser"]]: {
    basePrice: 1.7e14,
    baseValue: 4.3e8,
    flavorDescription: `Condenses the antimatter in the universe into ${compileVariable("pluralName")}.`,
  },
  [BuildingId["Cortex Baker"]]: {
    basePrice: 1.9e24,
    baseValue: 6.4e13,
    flavorDescription: `These artificial brains the size of planets are capable of simply dreaming up ${compileVariable(
      "pluralName",
    )} into existence. Time and space are inconsequential. Reality is arbitrary.`,
  },
  [BuildingId["Fractal Engine"]]: {
    basePrice: 3.1e17,
    baseValue: 1.5e11,
    flavorDescription: `Turns ${compileVariable("pluralName")} into even more ${compileVariable("pluralName")}.`,
  },
  [BuildingId["Javascript Console"]]: {
    basePrice: 7.1e19,
    baseValue: 1.1e12,
    flavorDescription: `Creates ${compileVariable("pluralName")} from the very code this game was written in.`,
  },
  [BuildingId["Time Machine"]]: {
    basePrice: 1.4e13,
    baseValue: 6.5e7,
    flavorDescription: `Brings ${compileVariable("pluralName")} from the past, before they were even consumed.`,
  },
  [BuildingId["Wizard Tower"]]: {
    basePrice: 3.3e8,
    baseValue: 4.4e4,
    flavorDescription: `Summons ${compileVariable("pluralName")} with magic spells.`,
  },
} as const satisfies Record<BuildingId, Except<Building, "id">>;
