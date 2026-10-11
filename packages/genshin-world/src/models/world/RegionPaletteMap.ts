import type { BuildingKit } from "#src/models/world/BuildingKit";

// Each region's building colours as its palette record samples them, each a hex number a material takes. A field the
// Palette leaves provisional or does not extract is absent, so its kit keeps its own constant, and Snezhnaya's kit has
// No record at all, so it keeps every one of its constants
export interface RegionPaletteMap {
  [BuildingKit.Fontaine]: { awning: number; slate: number; stone: number };
  [BuildingKit.Inazuma]: { roofTile: number; timber: number };
  [BuildingKit.Liyue]: { lacquer: number; roof: number; stone: number };
  [BuildingKit.Mondstadt]: { stone: number; timber: number };
  [BuildingKit.Natlan]: { building: number };
  [BuildingKit.NodKrai]: { iron: number };
  [BuildingKit.Sumeru]: { terrace: number };
}
