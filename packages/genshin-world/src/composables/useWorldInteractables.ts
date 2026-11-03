import type { Interactable } from "#src/models/interaction/Interactable";
import type { WorldInteractablesOptions } from "#src/models/interaction/WorldInteractablesOptions";
import type { Landmark } from "#src/models/world/Landmark";

import { useInteraction } from "#src/composables/useInteraction";
import { computeViewpointInteractables } from "#src/services/archive/computeViewpointInteractables";
import { computeCookingStoveInteractables } from "#src/services/cooking/computeCookingStoveInteractables";
import { CRAFTING_BENCH_INTERACTABLE_ID } from "#src/services/crafting/constants";
import {
  DOMAIN_ARENA_PROMPT_OFFSET,
  DOMAIN_LEAVE_INTERACTABLE_ID,
  DOMAIN_TREE_INTERACTABLE_ID,
} from "#src/services/domains/constants";
import { computeFishingInteractables } from "#src/services/fishing/computeFishingInteractables";
import { FORGE_INTERACTABLE_ID } from "#src/services/forging/constants";
import { computeHomePotInteractable } from "#src/services/home/computeHomePotInteractable";
import { computeHomeRealmInteractables } from "#src/services/home/computeHomeRealmInteractables";
import { computePlaceInteractables } from "#src/services/interaction/computePlaceInteractables";
import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { tapActionKey } from "#src/services/shared/tapActionKey";
import { ABYSS_ENTRANCE_INTERACTABLE_ID, ABYSS_ENTRANCE_POSITION } from "#src/services/spiralAbyss/constants";
import { computeStatueInteractables } from "#src/services/statue/computeStatueInteractables";
import { useWorldMapStore } from "#src/store/map";
import { useWorldSessionStore } from "#src/store/session";
import { InputAction } from "genshin-engine";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// Every prompt the world offers, joined from the sources that hold them and read beside the character's body: what is in
// Reach is listed, selected and acted on as the key is pressed. Each prompt stands on the ground beneath its point
export const useWorldInteractables = ({
  archiveData,
  blacksmithPlace,
  characterBody,
  chestInteractables,
  cookingStovePlace,
  craftingBenchPlace,
  domainArena,
  fishingPointPlaces,
  frostbearingTreePlaces,
  getGroundHeight,
  homePotPoint,
  homeRealmVisit,
  input,
  isDomainTreeRaised,
  isFishingOpen,
  offeredViewpoints,
  outcropInteractables,
  pickUpInteractables,
  residentInteractables,
  shrineInteractables,
  trounceBlossomInteractables,
  unlockedDomainEntrances,
  viewpointPlaceMap,
}: WorldInteractablesOptions) => {
  const worldMapStore = useWorldMapStore();
  const { lockedJumpLandmarks, unlockedLandmarks } = storeToRefs(worldMapStore);
  const worldSessionStore = useWorldSessionStore();
  // The arena's leave prompt, and the Petrified Tree's prompt once a clear has raised it, both beside the arena's centre
  const domainArenaInteractables = computed<Interactable[]>(() => {
    if (!domainArena.value) return [];
    const { x, z } = domainArena.value.center;
    const y = getGroundHeight(x, z);
    return [
      {
        id: DOMAIN_LEAVE_INTERACTABLE_ID,
        kind: InteractionKind.Activate,
        name: worldSessionStore.gameText[GameTextKey.DomainLeave],
        position: { x: x - DOMAIN_ARENA_PROMPT_OFFSET, y, z },
      },
      ...(isDomainTreeRaised.value
        ? [
            {
              id: DOMAIN_TREE_INTERACTABLE_ID,
              kind: InteractionKind.Activate,
              name: worldSessionStore.gameText[GameTextKey.PetrifiedTree],
              position: { x: x + DOMAIN_ARENA_PROMPT_OFFSET, y, z },
            },
          ]
        : []),
    ];
  });
  // The offered viewpoints, each a prompt on the ground beneath its place, named by its own name in the reader's language
  const viewpointInteractables = computed<Interactable[]>(() =>
    archiveData.value
      ? computeViewpointInteractables(
          offeredViewpoints.value,
          viewpointPlaceMap.value,
          archiveData.value.textMap,
          getGroundHeight,
        )
      : [],
  );
  const interactables = computed<Interactable[]>(() => {
    if (homeRealmVisit.value) return computeHomeRealmInteractables(worldSessionStore.gameText);
    // The Spiral Abyss's entrance is offered on the key as the Moon Spire's, standing provisionally at the centre of Cape Oath
    const { x: abyssX, z: abyssZ } = ABYSS_ENTRANCE_POSITION;
    const abyssEntrance: Interactable = {
      id: ABYSS_ENTRANCE_INTERACTABLE_ID,
      kind: InteractionKind.Activate,
      name: worldSessionStore.gameText[GameTextKey.AbyssMoonSpire],
      position: { x: abyssX, y: getGroundHeight(abyssX, abyssZ), z: abyssZ },
    };
    // Each Frostbearing Tree is named by its game text and offered to on the key, so its row is an activation like a
    // Statue's
    const frostbearingTrees = frostbearingTreePlaces.map(({ id, position: { x, z } }) => ({
      id,
      kind: InteractionKind.Activate,
      name: worldSessionStore.gameText[GameTextKey.FrostbearingTree],
      position: { x, y: getGroundHeight(x, z), z },
    }));
    // A locked landmark is resonated with on the key, named by the game's text for its kind
    const toLandmarkInteractable = ({ id, position: { x, z } }: Landmark, textKey: GameTextKey): Interactable => ({
      id,
      kind: InteractionKind.Activate,
      name: worldSessionStore.gameText[textKey],
      position: { x, y: getGroundHeight(x, z), z },
    });
    return [
      ...pickUpInteractables.value,
      ...residentInteractables.value,
      ...chestInteractables.value,
      ...shrineInteractables.value,
      ...outcropInteractables.value,
      ...trounceBlossomInteractables.value,
      ...frostbearingTrees,
      ...viewpointInteractables.value,
      abyssEntrance,
      ...computeStatueInteractables(
        unlockedLandmarks.value,
        worldSessionStore.gameText[GameTextKey.StatueWorship],
        getGroundHeight,
      ),
      ...lockedJumpLandmarks.value.map((landmark) =>
        toLandmarkInteractable(landmark, computeJumpLandmarkTextKey(landmark)),
      ),
      // An unlocked domain entrance is entered on the key, its screen opened with its levels
      ...unlockedDomainEntrances.value.map((landmark) => toLandmarkInteractable(landmark, GameTextKey.DomainEnter)),
      ...domainArenaInteractables.value,
      ...computePlaceInteractables(
        CRAFTING_BENCH_INTERACTABLE_ID,
        craftingBenchPlace,
        worldSessionStore.gameText[GameTextKey.CraftingTitle],
        getGroundHeight,
      ),
      ...computeCookingStoveInteractables(
        cookingStovePlace.value,
        {
          cooking: worldSessionStore.gameText[GameTextKey.CookingTitle],
          processing: worldSessionStore.gameText[GameTextKey.ProcessingStart],
        },
        getGroundHeight,
      ),
      ...computePlaceInteractables(
        FORGE_INTERACTABLE_ID,
        blacksmithPlace.value,
        worldSessionStore.gameText[GameTextKey.ForgeTitle],
        getGroundHeight,
      ),
      ...computeFishingInteractables(
        fishingPointPlaces.value,
        isFishingOpen.value,
        worldSessionStore.gameText,
        getGroundHeight,
      ),
      ...(homePotPoint.value
        ? [computeHomePotInteractable(worldSessionStore.gameText, homePotPoint.value, getGroundHeight)]
        : []),
    ];
  });
  const interaction = useInteraction(() => interactables.value, characterBody);
  // A prompt's row pressed itself, by a tap or a click with the cursor shown: it is selected and Interact tapped
  const pressInteractable = (id: string) => {
    interaction.selectInteractable(id);
    tapActionKey(input, InputAction.Interact);
  };
  return { interactables, ...interaction, pressInteractable };
};
