import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { Ref } from "vue";

// What the keeper's request offer reaches the world through: the quest it accepts into, the quests and their words its title
// Is read from, the progress and the claims the week's limit counts, and the bounty whose hunt holds the request back
// And whose claim or offer the keeper's accept answers before a request
export interface ReputationRequestOptions {
  acceptQuest: (questId: string) => void;
  bountyHunt: Readonly<Ref<ReputationBountyHunt | undefined>>;
  claimBounty: () => void;
  questProgressMap: Readonly<Ref<ReadonlyMap<string, QuestProgress>>>;
  quests: Readonly<Ref<Quest[]>>;
  questTextMap: Readonly<Ref<Readonly<Record<string, string>>>>;
  reputation: Readonly<Ref<ReputationProgress>>;
  reputationBountyOffer: Readonly<Ref<ReputationBountyOffer | undefined>>;
  reputationCity: Readonly<Ref<ReputationCity | undefined>>;
  requestClaimedAts: Readonly<Ref<readonly Temporal.Instant[]>>;
  takeBounty: () => void;
}
