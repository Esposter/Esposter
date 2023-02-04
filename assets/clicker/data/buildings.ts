import type { Building } from "@/models/clicker";
import { BuildingName } from "@/models/clicker";
import { ITEM_NAME } from "@/utils/constants.client";

export const buildings: Building[] = [
  {
    name: BuildingName.Cursor,
    flavorDescription: "Autoclicks once every 10 seconds.",
    basePrice: 15,
    baseValue: 1e-1,
  },
  {
    name: BuildingName.Grandma,
    flavorDescription: `A nice grandma to make more ${ITEM_NAME}s.`,
    basePrice: 1e2,
    baseValue: 1,
  },
  {
    name: BuildingName.Farm,
    flavorDescription: `Grows ${ITEM_NAME} plants from ${ITEM_NAME} seeds.`,
    basePrice: 1.1e3,
    baseValue: 8,
  },
  {
    name: BuildingName.Mine,
    flavorDescription: `Mines out ${ITEM_NAME}s.`,
    basePrice: 1.2e4,
    baseValue: 47,
  },
  {
    name: BuildingName.Factory,
    flavorDescription: `Produces large quantities of ${ITEM_NAME}s.`,
    basePrice: 1.3e5,
    baseValue: 2.6e2,
  },
  {
    name: BuildingName.Bank,
    flavorDescription: `Generates ${ITEM_NAME}s from interest.`,
    basePrice: 1.4e6,
    baseValue: 1.4e3,
  },
  {
    name: BuildingName.Temple,
    flavorDescription: `Full of precious, ancient ${ITEM_NAME}s.`,
    basePrice: 2e7,
    baseValue: 7.8e3,
  },
  {
    name: BuildingName["Wizard Tower"],
    flavorDescription: `Summons ${ITEM_NAME}s with magic spells.`,
    basePrice: 3.3e8,
    baseValue: 4.4e4,
  },
  {
    name: BuildingName.Shipment,
    flavorDescription: `Brings in fresh ${ITEM_NAME}s from the ${ITEM_NAME} planet.`,
    basePrice: 5.1e9,
    baseValue: 2.6e5,
  },
  {
    name: BuildingName["Alchemy Lab"],
    flavorDescription: `Turns gold into ${ITEM_NAME}s!`,
    basePrice: 7.5e10,
    baseValue: 1.6e6,
  },
  {
    name: BuildingName.Portal,
    flavorDescription: `Opens a door to the ${ITEM_NAME}-verse.`,
    basePrice: 1e12,
    baseValue: 1e7,
  },
  {
    name: BuildingName["Time Machine"],
    flavorDescription: `Brings ${ITEM_NAME}s from the past, before they were even consumed.`,
    basePrice: 1.4e13,
    baseValue: 6.5e7,
  },
  {
    name: BuildingName["Antimatter Condenser"],
    flavorDescription: `Condenses the antimatter in the universe into ${ITEM_NAME}s.`,
    basePrice: 1.7e14,
    baseValue: 4.3e8,
  },
  {
    name: BuildingName.Prism,
    flavorDescription: `Converts light itself into ${ITEM_NAME}s.`,
    basePrice: 2.1e15,
    baseValue: 2.9e9,
  },
  {
    name: BuildingName.Chancemaker,
    flavorDescription: `Generates ${ITEM_NAME}s out of thin air through sheer luck.`,
    basePrice: 2.6e16,
    baseValue: 2.1e10,
  },
  {
    name: BuildingName["Fractal Engine"],
    flavorDescription: `Turns ${ITEM_NAME}s into even more ${ITEM_NAME}s.`,
    basePrice: 3.1e17,
    baseValue: 1.5e11,
  },
  {
    name: BuildingName["Javascript Console"],
    flavorDescription: `Creates ${ITEM_NAME}s from the very code this game was written in.`,
    basePrice: 7.1e19,
    baseValue: 1.1e12,
  },
  {
    name: BuildingName.Idleverse,
    flavorDescription: `There's been countless other idle universes running alongside our own. You've finally found a way to hijack their production and convert whatever they've been making into ${ITEM_NAME}s!`,
    basePrice: 1.2e22,
    baseValue: 8.3e12,
  },
  {
    name: BuildingName["Cortex Baker"],
    flavorDescription: `These artificial brains the size of planets are capable of simply dreaming up ${ITEM_NAME}s into existence. Time and space are inconsequential. Reality is arbitrary.`,
    basePrice: 1.9e24,
    baseValue: 6.4e13,
  },
];
