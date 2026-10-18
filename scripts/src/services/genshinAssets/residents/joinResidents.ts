import type { ResidentPlacement } from "#src/models/genshinAssets/residents/ResidentPlacement";
import type { GroundPoint } from "genshin-engine";
import type { Resident, ResidentSpot } from "genshin-world";

// The residents each region holds, and what was left out of the join: an NPC a crafting bench stands for, which is an
// Interaction point rather than a person, an NPC with no name, an NPC no talk of the game names, and each repeat
// Placement of an NPC already placed in its region, which the first placement stands for
export interface ResidentJoin {
  craftingBench: number;
  noName: number;
  noTalk: number;
  regions: Map<string, Resident[]>;
  repeated: number;
}

// Each NPC placed in a region as a resident of it, at the place of its first birth record there, which is its day spot.
// Its night spot is the one the map gives it, and none otherwise, since the game's records give no second place to tell the
// Day's from the night's. Its name and
// The talk F begins with it are the game's, and an NPC with no name or no talk is left out, since the schema takes
// Neither empty. An NPC a crafting bench stands for is left out first, since the bench is its interaction, not a person
export const joinResidents = (
  placements: readonly ResidentPlacement[],
  nameTextIdMap: ReadonlyMap<number, string>,
  talkIdMap: ReadonlyMap<number, number>,
  getAreaId: (region: string, position: GroundPoint) => string,
  craftingBenchNpcIds: ReadonlySet<number>,
  nightSpotMap: ReadonlyMap<number, ResidentSpot>,
): ResidentJoin => {
  const join: ResidentJoin = { craftingBench: 0, noName: 0, noTalk: 0, regions: new Map(), repeated: 0 };
  const placedKeys = new Set<string>();
  for (const { npcId, position, region, rotation } of placements) {
    const placedKey = `${region}:${npcId}`;
    if (placedKeys.has(placedKey)) {
      join.repeated++;
      continue;
    }
    placedKeys.add(placedKey);
    if (craftingBenchNpcIds.has(npcId)) {
      join.craftingBench++;
      continue;
    }
    const nameTextId = nameTextIdMap.get(npcId) ?? "";
    if (!nameTextId) {
      join.noName++;
      continue;
    }
    const talkId = talkIdMap.get(npcId);
    if (talkId === undefined) {
      join.noTalk++;
      continue;
    }
    const night = nightSpotMap.get(npcId);
    const resident: Resident = {
      areaId: getAreaId(region, position),
      day: { position, rotation },
      id: String(npcId),
      nameTextId,
      ...(night && { night }),
      talkId: String(talkId),
    };
    const regionResidents = join.regions.get(region);
    if (regionResidents) regionResidents.push(resident);
    else join.regions.set(region, [resident]);
  }
  return join;
};
