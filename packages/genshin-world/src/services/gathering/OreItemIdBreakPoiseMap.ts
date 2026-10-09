import type { OrePoiseRequirement } from "#src/models/gathering/OrePoiseRequirement";

// Each ore's item id to the poise it takes to break, from its blunt hits and from its melee hits, as the wiki's Mineral
// Page gives them. The ids are the materials table's
export const OreItemIdBreakPoiseMap: Record<number, OrePoiseRequirement> = {
  // Noctilucous Jade
  100_028: { blunt: 286, melee: 2000 },
  // Cor Lapis
  100_058: { blunt: 286, melee: 2000 },
  // Iron Chunk
  101_001: { blunt: 29, melee: 200 },
  // White Iron Chunk
  101_002: { blunt: 29, melee: 200 },
  // Crystal Chunk
  101_003: { blunt: 286, melee: 2000 },
  // Magical Crystal Chunk
  101_004: { blunt: 286, melee: 2000 },
  // Starsilver
  101_006: { blunt: 29, melee: 200 },
  // Amethyst Lump
  101_008: { blunt: 286, melee: 2000 },
  // Condessence Crystal
  101_009: { blunt: 286, melee: 2000 },
  // Trishiraite
  101_224: { blunt: 286, melee: 2000 },
  // Clearwater Jade
  101_241: { blunt: 286, melee: 2000 },
};
