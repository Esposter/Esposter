import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import type { Ref } from "vue";

// What the keeper's request offer reaches the world through: the quest it accepts into, the quests and their words its title
// Is read from, the progress and the claims the week's limit counts, and the bounty whose hunt holds the request back
// And whose claim or offer the keeper's accept answers before a request
export interface ReputationRequestOptions {
  bountyHunt: Readonly<Ref<ReputationBountyHunt | undefined>>;
  claimBounty: () => void;
  reputationBountyOffer: Readonly<Ref<ReputationBountyOffer | undefined>>;
  takeBounty: () => void;
}
