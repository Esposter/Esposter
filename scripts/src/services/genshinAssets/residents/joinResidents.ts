import type { ResidentPlacement } from "#src/models/genshinAssets/residents/ResidentPlacement";
import type { GroundPoint } from "genshin-engine";
import type { Resident } from "genshin-world";

// The residents each region holds, and what was left out of the join: an NPC with no name, an NPC no talk of the game
// Names, and each placement of an NPC already placed in its region, which the first placement stands for
export interface ResidentJoin {
  noName: number;
  noTalk: number;
  regions: Map<string, Resident[]>;
  repeated: number;
}

// Each NPC placed in a region as a resident of it, at the place of its first birth record there, which is its day spot,
// Its night spot unset since the game's records give no second place to tell the day's from the night's. Its name and
// Its talk are the game's: the talk is the lowest-numbered one the NPC speaks, and an NPC with no name or no talk is
// Left out, since the schema takes neither empty
export const joinResidents = (
  placements: readonly ResidentPlacement[],
  nameTextIdMap: ReadonlyMap<number, string>,
  talkIdMap: ReadonlyMap<number, readonly number[]>,
  getAreaId: (region: string, position: GroundPoint) => string,
): ResidentJoin => {
  const join: ResidentJoin = { noName: 0, noTalk: 0, regions: new Map(), repeated: 0 };
  const placedKeys = new Set<string>();
  for (const { npcId, position, region, rotation } of placements) {
    const placedKey = `${region}:${npcId}`;
    if (placedKeys.has(placedKey)) {
      join.repeated++;
      continue;
    }
    placedKeys.add(placedKey);
    const nameTextId = nameTextIdMap.get(npcId) ?? "";
    if (!nameTextId) {
      join.noName++;
      continue;
    }
    const [talkId] = talkIdMap.get(npcId) ?? [];
    if (talkId === undefined) {
      join.noTalk++;
      continue;
    }
    const resident: Resident = {
      areaId: getAreaId(region, position),
      day: { position, rotation },
      id: String(npcId),
      nameTextId,
      talkId: String(talkId),
    };
    const regionResidents = join.regions.get(region);
    if (regionResidents) regionResidents.push(resident);
    else join.regions.set(region, [resident]);
  }
  return join;
};
