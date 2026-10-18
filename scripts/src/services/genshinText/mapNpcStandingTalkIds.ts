import type { DumpedTalkConfig } from "#src/models/genshinText/DumpedTalkConfig";

// The way a talk begins when the player presses F on its character
const TALK_BEGIN_MANUAL = "TALK_BEGIN_MANUAL";

// Each character's standing talk: the talk F begins with them whatever the quests hold, one begun by hand that belongs
// To no quest, loads by default, waits on nothing and has a first dialog. A character the table gives several is
// Given the lowest-numbered, which is the root its others follow on from
export const mapNpcStandingTalkIds = (talkConfigs: Iterable<DumpedTalkConfig>): Map<number, number> => {
  const npcStandingTalkIdMap = new Map<number, number>();
  for (const { beginCond, beginWay, id, initDialog, loadType, npcId, questId } of talkConfigs) {
    if (
      beginWay !== TALK_BEGIN_MANUAL ||
      questId !== 0 ||
      loadType !== undefined ||
      initDialog === 0 ||
      beginCond.some(({ type }) => type !== undefined)
    )
      continue;
    for (const npc of npcId) {
      const standingTalkId = npcStandingTalkIdMap.get(npc);
      if (standingTalkId === undefined || id < standingTalkId) npcStandingTalkIdMap.set(npc, id);
    }
  }
  return npcStandingTalkIdMap;
};
