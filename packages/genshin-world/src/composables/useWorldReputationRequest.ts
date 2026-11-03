import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";
import type { ReputationRequestOptions } from "#src/models/reputation/ReputationRequestOptions";

import { ReputationRequestQuestIds } from "#src/models/quest/QuestId";
import { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import { offerReputationRequest } from "#src/services/reputation/offerReputationRequest";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldReputationStore } from "#src/store/reputation";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

export const useWorldReputationRequest = ({
  bountyHunt,
  claimBounty,
  reputationBountyOffer,
  takeBounty,
}: ReputationRequestOptions) => {
  const worldReputationStore = useWorldReputationStore();
  const { reputation, reputationCity, requestClaimedAts } = storeToRefs(worldReputationStore);
  const worldQuestsStore = useWorldQuestsStore();
  const { questProgressMap, quests, questTextMap } = storeToRefs(worldQuestsStore);
  const { acceptQuest } = worldQuestsStore;
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow } = worldSessionStore;
  // The request the keeper offers as her screen opens, drawn from the requests the world carries that the player has not
  // Started, not kept with the save, and none past the week's request limit: a provisional rule until the weekly refresh is read
  const reputationOffer = shallowRef<ReputationRequest>();
  // The request waits while a taken bounty hunts, and is offered once the bounty is claimed
  const reputationRequestOffer = computed(() => (bountyHunt.value ? undefined : reputationOffer.value));
  const reputationOfferTitle = computed(() => {
    const request = reputationRequestOffer.value;
    const quest = request && quests.value.find(({ id }) => id === String(request.questId));
    return quest ? questTextMap.value[quest.titleTextId] : undefined;
  });
  const drawReputationOffer = () => {
    if (!reputationCity.value) return;
    const offerableQuestIds = ReputationRequestQuestIds.filter((questId) => !questProgressMap.value.has(questId));
    reputationOffer.value = offerReputationRequest(
      reputationCity.value,
      reputation.value.level,
      Math.random(),
      offerableQuestIds,
      requestClaimedAts.value,
      getWorldNow(),
    );
  };
  const acceptReputationRequest = () => {
    if (!reputationRequestOffer.value) return;
    acceptQuest(String(reputationRequestOffer.value.questId));
    reputationOffer.value = undefined;
  };
  // Accepting the offer claims the bounty hunted, takes the bounty offered, or starts the request, whose quest the world then
  // Runs as any other
  const acceptReputationOffer = () => {
    if (reputationBountyOffer.value === ReputationBountyOffer.Claim) claimBounty();
    else if (reputationBountyOffer.value === ReputationBountyOffer.Offer) takeBounty();
    else acceptReputationRequest();
  };
  return { acceptReputationOffer, drawReputationOffer, reputationOfferTitle };
};
