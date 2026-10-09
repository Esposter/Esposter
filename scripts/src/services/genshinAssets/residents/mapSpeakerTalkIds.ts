import type { DumpedDialogSpeaker } from "#src/models/genshinAssets/residents/DumpedDialogSpeaker";

// The talks each NPC speaks in, each NPC's talk ids in ascending order without repeats, so the first is the talk the
// NPC is lowest in
export const mapSpeakerTalkIds = (speakers: readonly DumpedDialogSpeaker[]): Map<number, number[]> =>
  new Map(
    Map.groupBy(speakers, ({ speakerId }) => speakerId)
      .entries()
      .map(([speakerId, lines]) => {
        const talkIds = [...new Set(lines.map(({ talkId }) => talkId))].toSorted(
          (firstId, secondId) => firstId - secondId,
        );
        return [speakerId, talkIds] as const;
      }),
  );
