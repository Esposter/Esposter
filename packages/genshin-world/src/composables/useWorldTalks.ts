import type { Talk } from "#src/models/dialogue/Talk";
import type { GcgLevels } from "#src/models/gcg/GcgLevels";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getTalkOffers } from "#src/services/dialogue/getTalkOffers";
import { mergeTalks } from "#src/services/dialogue/mergeTalks";
import { checkIsGcgCardGameOpen } from "#src/services/gcg/checkIsGcgCardGameOpen";
import { computeGcgPlayerLevel } from "#src/services/gcg/computeGcgPlayerLevel";
import { GCG_TUTORIAL_QUEST_ID } from "#src/services/gcg/constants";
import { listGcgOpenGameIds } from "#src/services/gcg/listGcgOpenGameIds";
import { readGcgLevels } from "#src/services/gcg/readGcgLevels";
import { readStandingTalks } from "#src/services/resident/readStandingTalks";
import { StandingTalkTextLoaderMap } from "#src/services/resident/StandingTalkTextLoaderMap";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync } from "@esposter/shared";
import { InteractionKind } from "genshin-interface";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

// The talks a resident begins and the talk the world runs, held by id: the quests in progress hold theirs, the quests not
// Yet started the talks offering them, and the residents their standing talks, read with their words as the world
// Starts. A quest's talk wins a shared id
export const useWorldTalks = ({
  closeScreen,
  getCardGameExp,
  getGroundHeight,
  getResidents,
  getResidentSpot,
}: {
  closeScreen: () => void;
  // The card game's EXP the player holds, which with the main quests they have finished sets their Player Level
  getCardGameExp: () => number;
  getGroundHeight: (x: number, z: number) => number;
  getResidents: () => Resident[];
  getResidentSpot: (residentId: string) => ResidentSpot | undefined;
  // The world's names by text id, which name a resident's row
}) => {
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { completedMainQuestIds, rank } = storeToRefs(worldAdventureRankStore);
  const worldQuestsStore = useWorldQuestsStore();
  const { questProgressMap, questsInProgress, questsOffered, questTextMap } = storeToRefs(worldQuestsStore);
  const worldSessionStore = useWorldSessionStore();
  const { events } = worldSessionStore;
  const talk = shallowRef<Talk>();
  // The game of the card game the resident's talk offers a duel of, if it offers one, and the game being played now
  const talkDuelGameId = shallowRef<number>();
  const gcgGameId = shallowRef<number>();
  const standingTalks = shallowRef<Talk[]>([]);
  const standingTalkTextMap = shallowRef<Readonly<Record<string, string>>>({});
  // The card game's levels, which open each challenger's duels by the Player Level. Until they arrive, or if they
  // Cannot be read, no duel is offered
  const gcgLevels = shallowRef<GcgLevels>();
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readGcgLevels(worldSessionStore.gameDataBaseUrl)).match(
    (newGcgLevels) => {
      gcgLevels.value = newGcgLevels;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readStandingTalks(worldSessionStore.gameDataBaseUrl)).match(
    (newStandingTalks) => {
      standingTalks.value = newStandingTalks;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => StandingTalkTextLoaderMap[worldSessionStore.language](worldSessionStore.gameDataBaseUrl)).match(
    (newStandingTalkTextMap) => {
      standingTalkTextMap.value = newStandingTalkTextMap;
    },
    (error) => {
      console.error(error);
    },
  );
  const talkMap = computed(() =>
    mergeTalks(
      [
        ...questsInProgress.value.flatMap(({ talks }) => talks),
        ...questsOffered.value.flatMap(({ offerTalkIds, talks }) =>
          talks.filter(({ id }) => offerTalkIds.includes(id)),
        ),
      ],
      standingTalks.value,
    ),
  );
  // The quests whose talks a resident may be offered: those in progress, and those a talk offers not yet started
  const questsOpen = computed(() => [...questsInProgress.value, ...questsOffered.value]);
  // Every talk's words, the quests' and the standing talks', which name a standing talk's offers by their quest's title
  const talkTextMap = computed(() => ({ ...questTextMap.value, ...standingTalkTextMap.value }));
  // The quest talks the talk running offers on its first line: a standing talk offers each one open to the characters it
  // Is begun on, and a quest's talk offers none
  const talkOffers = computed(() =>
    talk.value && standingTalks.value.includes(talk.value)
      ? getTalkOffers(questsOpen.value, questProgressMap.value, talk.value.npcIds)
      : [],
  );
  // The card game's duel a resident offers from the talk it begins: the duel they are seated at, once the card game
  // Is open and the Player Level has opened that duel's game
  const getTalkDuelGameId = (talkId: string) => {
    const duelGameId = getResidents().find((resident) => resident.talkId === talkId)?.duelGameId;
    if (duelGameId === undefined || !checkIsGcgCardGameOpen(rank.value) || !gcgLevels.value) return undefined;
    const { challengerGames, playerLevelLocks, playerLevels } = gcgLevels.value;
    const cardGameExp = getCardGameExp();
    const playerLevel = computeGcgPlayerLevel(
      cardGameExp,
      playerLevels,
      completedMainQuestIds.value.has(GCG_TUTORIAL_QUEST_ID),
      playerLevelLocks,
      completedMainQuestIds.value,
    );
    // A challenger's games are listed under the NPC whose week row names them, which is not always the NPC seated at
    // The duel (Marjorie's row is 9701, her seat 1435), so the seat's game is looked for by its id across every row
    const challengerGameList = Object.values(challengerGames).flat();
    return listGcgOpenGameIds(challengerGameList, playerLevel).includes(duelGameId) ? duelGameId : undefined;
  };
  // A resident is a row only at the spot they are shown at this hour, so one absent from it is no row. F begins their
  // Own talk where the world holds it, else the first quest talk open to them, and a resident with neither is no row
  const residentInteractables = computed<Interactable[]>(() =>
    getResidents().flatMap(({ id, nameTextId, talkId }) => {
      const spot = getResidentSpot(id);
      const residentTalkId = talkMap.value.has(talkId)
        ? talkId
        : (getTalkOffers(questsOpen.value, questProgressMap.value, [id])[0]?.talkId ?? "");
      if (!spot || !residentTalkId) return [];
      const { x, z } = spot.position;
      return [
        {
          id: residentTalkId,
          kind: InteractionKind.Talk,
          name: worldSessionStore.nameText[nameTextId] ?? "",
          position: { x, y: getGroundHeight(x, z), z },
        },
      ];
    }),
  );
  // A quest's talk chosen on a standing talk's opening line runs in its place, and offers no duel of its own
  const beginTalk = (talkId: string) => {
    talk.value = talkMap.value.get(talkId);
    talkDuelGameId.value = undefined;
  };
  // A talk that ends is a talk-to for the quests in progress, and the world is back under the Traveler
  const endTalk = () => {
    if (talk.value) events.emit("questEvent", { kind: QuestObjectiveKind.TalkTo, targetId: talk.value.id });
    closeScreen();
  };
  return {
    beginTalk,
    endTalk,
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
