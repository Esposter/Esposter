import type { DumpedDialogSpeaker } from "#src/models/genshinAssets/residents/DumpedDialogSpeaker";

// The lowest-numbered talk each NPC speaks in
export const mapSpeakerTalkIds = (speakers: readonly DumpedDialogSpeaker[]): Map<number, number> => {
  const speakerTalkIdMap = new Map<number, number>();
  for (const { speakerId, talkId } of speakers) {
    const lowestTalkId = speakerTalkIdMap.get(speakerId);
    if (lowestTalkId === undefined || talkId < lowestTalkId) speakerTalkIdMap.set(speakerId, talkId);
  }
  return speakerTalkIdMap;
};
