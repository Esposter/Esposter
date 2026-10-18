import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { ExcelTriggerRow } from "#src/models/genshinAssets/sceneGroups/ExcelTriggerRow";
import type { SceneGroupMember, SceneNpcBorn } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { readSceneBuildingPoints } from "#src/services/genshinAssets/sceneGroups/readSceneBuildingPoints";
import { readViewpointMembers } from "#src/services/genshinAssets/sceneGroups/readViewpointMembers";
import { SCENE_NPC_BORN_KEY } from "#src/services/genshinAssets/sceneNpcBorn/constants";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { TRIGGER_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { getOrCreate } from "@esposter/shared";
import { SceneGroupMemberKind, SceneGroupSource, sceneGroupsSchema, sceneNpcBornSchema } from "genshin-world";
import { z } from "zod";

// One NPC birth as a member of its group: the NPC it places, its place and turn, and the suites it is born in
const toNpcMember = ({ configId, position, rotationY, suiteIds }: SceneNpcBorn): SceneGroupMember => ({
  kind: SceneGroupMemberKind.Npc,
  objectId: configId,
  place: {
    height: position.y,
    position: { x: position.x, z: position.z },
    ...(rotationY === undefined ? {} : { rotationY }),
    source: SceneGroupSource.NpcBirths,
  },
  source: SceneGroupSource.NpcBirths,
  suiteIds,
});

// The open world's scene group record, each field filled from the best source that holds it today: the NPCs and their
// Places and suites from the hosted NPC births, the viewpoints from the codex placed by the official map's points, the
// Quest triggers from the trigger table with no place, and the building points from the scene's own points. What only
// The group scripts hold is left out. The notes count each source's members
export const buildSceneGroups = async (): Promise<GameDataBuild> => {
  const [publishedBirths, viewpointMembers, buildings] = await Promise.all([
    readPublishedGameData<unknown>(SCENE_NPC_BORN_KEY),
    readViewpointMembers(),
    readSceneBuildingPoints(),
  ]);
  const births = z.array(sceneNpcBornSchema).parse(publishedBirths);
  const triggers = readExcelTable<ExcelTriggerRow>(TRIGGER_TABLE_NAME).filter(
    ({ sceneId }) => sceneId === OPEN_WORLD_SCENE_ID,
  );
  const groupMembersMap = new Map<number, SceneGroupMember[]>();
  for (const [groupId, member] of [
    ...births.map((birth): [number, SceneGroupMember] => [birth.groupId, toNpcMember(birth)]),
    ...viewpointMembers,
    ...triggers.map((trigger): [number, SceneGroupMember] => [
      trigger.groupId,
      { kind: SceneGroupMemberKind.Trigger, objectId: trigger.id, source: SceneGroupSource.TriggerTable },
    ]),
  ])
    getOrCreate(groupMembersMap, groupId, () => []).push(member);
  const sceneGroups = sceneGroupsSchema.parse({ buildings, groups: Object.fromEntries(groupMembersMap) });
  const placedViewpointCount = viewpointMembers.filter(([, { place }]) => place !== undefined).length;
  return {
    notes: [
      `${groupMembersMap.size} groups in scene ${OPEN_WORLD_SCENE_ID}`,
      `${births.length} NPCs placed from the hosted NPC births`,
      `${placedViewpointCount} of ${viewpointMembers.length} viewpoints placed from the official map, the rest matched to no one point on the ground`,
      `${triggers.length} quest triggers, unplaced`,
      `${Object.keys(buildings).length} building points`,
    ],
    objects: { [SCENE_GROUPS_KEY]: sceneGroups },
  };
};
