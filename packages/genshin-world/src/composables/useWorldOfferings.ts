import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { Ref, ShallowRef } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { OfferingKind } from "#src/models/offering/OfferingKind";
import { computeOfferingInteractables } from "#src/services/offering/computeOfferingInteractables";
import { FROSTBEARING_TREE_OFFERING_ID } from "#src/services/offering/constants";
import { getOfferingProgress } from "#src/services/offering/getOfferingProgress";
import { offerBagItems } from "#src/services/offering/offerBagItems";
import { readOfferingLevels } from "#src/services/offering/readOfferingLevels";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldPickupsStore } from "#src/store/pickups";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// Each offering in the world is offered to on the key: every offering item the bag holds is offered to it at once, its
// Levels reached, their Adventure EXP gained at the Adventure Rank and their other rewards paid in, what the bag has no room
// For dropped at the offering as a pick up, and the held counts and level it keeps by its kind are the progress the save
// Holds. Its levels are read from the game's table as an offer is made rather than with the world, and the bag is read once
// They have arrived, so an offer made while another's levels are still arriving offers the bag that one left
export const useWorldOfferings = ({
  offeringLandmarks,
  offeringProgressMap,
}: {
  offeringLandmarks: Readonly<Ref<OfferingLandmark[]>>;
  offeringProgressMap: ShallowRef<ReadonlyMap<string, OfferingProgressSave>>;
}) => {
  const worldGroundStore = useWorldGroundStore();
  const { getGroundHeight } = worldGroundStore;
  const worldPickupsStore = useWorldPickupsStore();
  const { placeWorldDrops } = worldPickupsStore;
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { gainWorldAdventureExp } = worldAdventureRankStore;
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { events, setInventory, setWallet } = worldSessionStore;
  // Each offering in reach is a prompt on the ground beneath its point, named by its kind
  const offeringInteractables = computed(() =>
    computeOfferingInteractables(offeringLandmarks.value, worldSessionStore.gameText, getGroundHeight),
  );
  // Levels that fail to arrive are logged and the bag is left as it was
  const offerOffering = (offeringKind: OfferingKind, source: Pick<WorldDrop, "id" | "position">) =>
    getResultAsync(() => readOfferingLevels(worldSessionStore.gameDataBaseUrl, offeringKind)).match(
      (levels) => {
        const progress = getOfferingProgress(offeringProgressMap.value, offeringKind);
        const offer = offerBagItems(
          inventory.value,
          wallet.value,
          { ...progress, levels },
          worldSessionStore.nameText,
          worldSessionStore.materialDataMap,
        );
        setInventory(offer.inventory);
        setWallet(offer.wallet);
        gainWorldAdventureExp(offer.adventureExp);
        placeWorldDrops(source, offer.overflowItems);
        offeringProgressMap.value = new Map([
          ...offeringProgressMap.value,
          [offeringKind, { heldCounts: offer.progress.heldCounts, level: offer.progress.level }],
        ]);
        // The Frostbearing Tree's level reached is one doing, its quantity the level, which a level trigger reads against
        // Its own. The other offerings' game ids are not published with their places, so their levels reach no trigger yet
        if (offeringKind === OfferingKind.FrostbearingTree && offer.progress.level > progress.level)
          events.emit("achievementEvents", [
            {
              kind: AchievementEventKind.OfferingLevelReached,
              quantity: offer.progress.level,
              targetId: String(FROSTBEARING_TREE_OFFERING_ID),
            },
          ]);
      },
      (error) => {
        console.error(error);
      },
    );
  return { offeringInteractables, offerOffering };
};
