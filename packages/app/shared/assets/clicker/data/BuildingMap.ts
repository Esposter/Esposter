/* eslint-disable perfectionist/sort-objects */
import type { Building } from "#shared/models/clicker/data/building/Building";
import type { Except } from "type-fest";

import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { compileVariable } from "~~/shared/services/clicker/compiler/compileVariable";

export const BuildingMap = {
  [BuildingId.Cursor]: {
    flavorDescription: "Autoclicks once every 10 seconds.",
    basePrice: 15,
    baseValue: 1e-1,
  },
  [BuildingId.Grandma]: {
    flavorDescription: `A nice grandma to make more ${compileVariable("pluralName")}.`,
    basePrice: 1e2,
    baseValue: 1,
  },
  [BuildingId.Farm]: {
    flavorDescription: `Grows ${compileVariable("name")} plants from ${compileVariable("name")} seeds.`,
    basePrice: 1.1e3,
    baseValue: 8,
  },
  [BuildingId.Mine]: {
    flavorDescription: `Mines out ${compileVariable("pluralName")}.`,
    basePrice: 1.2e4,
    baseValue: 47,
  },
  [BuildingId.Factory]: {
    flavorDescription: `Produces large quantities of ${compileVariable("pluralName")}.`,
    basePrice: 1.3e5,
    baseValue: 2.6e2,
  },
  [BuildingId.Bank]: {
    flavorDescription: `Generates ${compileVariable("pluralName")} from interest.`,
    basePrice: 1.4e6,
    baseValue: 1.4e3,
  },
  [BuildingId.Temple]: {
    flavorDescription: `Full of precious, ancient ${compileVariable("pluralName")}.`,
    basePrice: 2e7,
    baseValue: 7.8e3,
  },
  [BuildingId["Wizard Tower"]]: {
    flavorDescription: `Summons ${compileVariable("pluralName")} with magic spells.`,
    basePrice: 3.3e8,
    baseValue: 4.4e4,
  },
  [BuildingId.Shipment]: {
    flavorDescription: `Brings in fresh ${compileVariable("pluralName")} from the ${compileVariable("name")} planet.`,
    basePrice: 5.1e9,
    baseValue: 2.6e5,
  },
  [BuildingId["Alchemy Lab"]]: {
    flavorDescription: `Turns gold into ${compileVariable("pluralName")}!`,
    basePrice: 7.5e10,
    baseValue: 1.6e6,
  },
  [BuildingId.Portal]: {
    flavorDescription: `Opens a door to the ${compileVariable("name")}-verse.`,
    basePrice: 1e12,
    baseValue: 1e7,
  },
  [BuildingId["Time Machine"]]: {
    flavorDescription: `Brings ${compileVariable("pluralName")} from the past, before they were even consumed.`,
    basePrice: 1.4e13,
    baseValue: 6.5e7,
  },
  [BuildingId["Antimatter Condenser"]]: {
    flavorDescription: `Condenses the antimatter in the universe into ${compileVariable("pluralName")}.`,
    basePrice: 1.7e14,
    baseValue: 4.3e8,
  },
  [BuildingId.Prism]: {
    flavorDescription: `Converts light itself into ${compileVariable("pluralName")}.`,
    basePrice: 2.1e15,
    baseValue: 2.9e9,
  },
  [BuildingId.Chancemaker]: {
    flavorDescription: `Generates ${compileVariable("pluralName")} out of thin air through sheer luck.`,
    basePrice: 2.6e16,
    baseValue: 2.1e10,
  },
  [BuildingId["Fractal Engine"]]: {
    flavorDescription: `Turns ${compileVariable("pluralName")} into even more ${compileVariable("pluralName")}.`,
    basePrice: 3.1e17,
    baseValue: 1.5e11,
  },
  [BuildingId["Javascript Console"]]: {
    flavorDescription: `Creates ${compileVariable("pluralName")} from the very code this game was written in.`,
    basePrice: 7.1e19,
    baseValue: 1.1e12,
  },
  [BuildingId.Idleverse]: {
    flavorDescription: `There's been countless other idle universes running alongside our own. You've finally found a way to hijack their production and convert whatever they've been making into ${compileVariable(
      "pluralName",
    )}!`,
    basePrice: 1.2e22,
    baseValue: 8.3e12,
  },
  [BuildingId["Cortex Baker"]]: {
    flavorDescription: `These artificial brains the size of planets are capable of simply dreaming up ${compileVariable(
      "pluralName",
    )} into existence. Time and space are inconsequential. Reality is arbitrary.`,
    basePrice: 1.9e24,
    baseValue: 6.4e13,
  },
} as const satisfies Record<BuildingId, Except<Building, "id">>;
