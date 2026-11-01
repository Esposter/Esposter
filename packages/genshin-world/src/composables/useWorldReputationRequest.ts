import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";
import type { ReputationRequestOptions } from "#src/models/reputation/ReputationRequestOptions";

import { ReputationRequestQuestIds } from "#src/models/quest/QuestId";
import { offerReputationRequest } from "#src/services/reputation/offerReputationRequest";
import { computed, shallowRef } from "vue";

export const useWorldReputationRequest = ({
  acceptQuest,
  bountyHunt,
  getWorldNow,
  questProgressMap,
  quests,
  questTextMap,
  reputation,
  reputationCity,
  requestClaimedAts,
}: ReputationRequestOptions) => {
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
  return { acceptReputationRequest, drawReputationOffer, reputationOfferTitle };
};
