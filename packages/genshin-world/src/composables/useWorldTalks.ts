import type { Talk } from "#src/models/dialogue/Talk";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { GameLanguage } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { getTalkOffers } from "#src/services/dialogue/getTalkOffers";
import { mergeTalks } from "#src/services/dialogue/mergeTalks";
import { readStandingTalks } from "#src/services/resident/readStandingTalks";
import { StandingTalkTextLoaderMap } from "#src/services/resident/StandingTalkTextLoaderMap";
import { getResultAsync } from "@esposter/shared";
import { InteractionKind } from "genshin-interface";

// The talks a resident begins and the talk the world runs, held by id: the quests in progress hold theirs, and the
// Residents hold their standing talks, read with their words as the world starts. A quest's talk wins a shared id
export const useWorldTalks = ({
  gameDataBaseUrl,
  getGroundHeight,
  getResidents,
  getResidentSpot,
  language,
  questProgressMap,
  questsInProgress,
  questTextMap,
}: {
  gameDataBaseUrl: string;
  getGroundHeight: (x: number, z: number) => number;
  getResidents: () => Resident[];
  getResidentSpot: (residentId: string) => ResidentSpot | undefined;
  language: GameLanguage;
  questProgressMap: Ref<ReadonlyMap<string, QuestProgress>>;
  questsInProgress: ComputedRef<Quest[]>;
  questTextMap: Ref<Readonly<Record<string, string>>>;
}) => {
  const talk = shallowRef<Talk>();
  // The game of the card game the resident's talk offers a duel of, if it offers one, and the game being played now
  const talkDuelGameId = shallowRef<number>();
  const gcgGameId = shallowRef<number>();
  const standingTalks = shallowRef<Talk[]>([]);
  const standingTalkTextMap = shallowRef<Readonly<Record<string, string>>>({});
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readStandingTalks(gameDataBaseUrl)).match(
    (newStandingTalks) => {
      standingTalks.value = newStandingTalks;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => StandingTalkTextLoaderMap[language](gameDataBaseUrl)).match(
    (newStandingTalkTextMap) => {
      standingTalkTextMap.value = newStandingTalkTextMap;
    },
    (error) => {
      console.error(error);
    },
  );
  const talkMap = computed(() =>
    mergeTalks(
      questsInProgress.value.flatMap(({ talks }) => talks),
      standingTalks.value,
    ),
  );
  // Every talk's words, the quests' and the standing talks', which name a resident as their talk's speaker and a standing
  // Talk's offers by their quest's title
  const talkTextMap = computed(() => ({ ...questTextMap.value, ...standingTalkTextMap.value }));
  // The quest talks the talk running offers on its first line: a standing talk offers each one open to the characters it
  // Is begun on, and a quest's talk offers none
  const talkOffers = computed(() =>
    talk.value && standingTalks.value.includes(talk.value)
      ? getTalkOffers(questsInProgress.value, questProgressMap.value, talk.value.npcIds)
      : [],
  );
  // The card game's duel a resident offers from the talk it begins, if that resident offers one
  const getTalkDuelGameId = (talkId: string) =>
    getResidents().find((resident) => resident.talkId === talkId)?.duelGameId;
  // A resident is a row only at the spot they are shown at this hour, so one absent from it is no row. F begins their
  // Own talk where the world holds it, else the first quest talk open to them, and a resident with neither is no row
  const residentInteractables = computed<Interactable[]>(() =>
    getResidents().flatMap(({ id, nameTextId, talkId }) => {
      const spot = getResidentSpot(id);
      const residentTalkId = talkMap.value.has(talkId)
        ? talkId
        : (getTalkOffers(questsInProgress.value, questProgressMap.value, [id])[0]?.talkId ?? "");
      if (!spot || !residentTalkId) return [];
      const { x, z } = spot.position;
      return [
        {
          id: residentTalkId,
          kind: InteractionKind.Talk,
          name: talkTextMap.value[nameTextId] ?? "",
          position: { x, y: getGroundHeight(x, z), z },
        },
      ];
    }),
  );
  return {
    gcgGameId,
    getTalkDuelGameId,
    residentInteractables,
    talk,
    talkDuelGameId,
    talkMap,
    talkOffers,
    talkTextMap,
  };
};
