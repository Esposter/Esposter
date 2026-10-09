import type { Talk } from "#src/models/dialogue/Talk";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Quest } from "#src/models/quest/Quest";
import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { ComputedRef, Ref } from "vue";

import { mergeTalks } from "#src/services/dialogue/mergeTalks";
import { getStandingTalks } from "#src/services/resident/getStandingTalks";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { InteractionKind } from "genshin-interface";

// The talks a resident begins and the talk the world runs, held by id: the quests in progress hold theirs, and a resident
// Whose duel names a game holds the standing talk written for it. A quest's talk wins a shared id
export const useWorldTalks = ({
  getResidents,
  getResidentSpot,
  questsInProgress,
  questTextMap,
  standingTalkMap,
}: {
  getResidents: () => Resident[];
  getResidentSpot: (residentId: string) => ResidentSpot | undefined;
  questsInProgress: ComputedRef<Quest[]>;
  questTextMap: Ref<Readonly<Record<string, string>>>;
  standingTalkMap: ReadonlyMap<string, Talk>;
}) => {
  const talk = shallowRef<Talk>();
  // The game of the card game the resident's talk offers a duel of, if it offers one, and the game being played now
  const talkDuelGameId = shallowRef<number>();
  const gcgGameId = shallowRef<number>();
  const talkMap = computed(() =>
    mergeTalks(
      questsInProgress.value.flatMap(({ talks }) => talks),
      getStandingTalks(getResidents(), standingTalkMap),
    ),
  );
  // The card game's duel a resident offers from the talk it begins, if that resident offers one
  const getTalkDuelGameId = (talkId: string) =>
    getResidents().find((resident) => resident.talkId === talkId)?.duelGameId;
  // A resident is a row only at the spot they are shown at this hour, so one absent from it is no row
  const residentInteractables = computed<Interactable[]>(() =>
    getResidents().flatMap(({ id, nameTextId, talkId }) => {
      const spot = getResidentSpot(id);
      if (!spot || !talkMap.value.has(talkId)) return [];
      const { x, z } = spot.position;
      return [
        {
          id: talkId,
          kind: InteractionKind.Talk,
          name: questTextMap.value[nameTextId] ?? "",
          position: { x, y: getWorldHeight(x, z), z },
        },
      ];
    }),
  );
  return { gcgGameId, getTalkDuelGameId, residentInteractables, talk, talkDuelGameId, talkMap };
};
