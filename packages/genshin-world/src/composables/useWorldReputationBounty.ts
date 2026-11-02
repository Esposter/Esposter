import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { Ref } from "vue";

import { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import { computeBountyTrailEnds } from "#src/services/elementalSight/computeBountyTrailEnds";
import { claimWeeklyReputationBounty } from "#src/services/reputation/claimWeeklyReputationBounty";
import { REPUTATION_OFFER_FIRST_LEVEL } from "#src/services/reputation/constants";
import { createReputationBountyCamp } from "#src/services/reputation/createReputationBountyCamp";
import { defeatReputationBountyTarget } from "#src/services/reputation/defeatReputationBountyTarget";
import { takeReputationBounty } from "#src/services/reputation/takeReputationBounty";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldSessionStore } from "#src/store/session";
import { takeRandom } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

interface Props {
  payReputationReward: (reward: ReputationReward) => void;
  random: () => number;
  reputation: Readonly<Ref<ReputationProgress>>;
  reputationCity: Readonly<Ref<ReputationCity | undefined>>;
  // The moments of the bounty claims the save holds, those before the week's reset no longer counted
  savedBountyClaimedAts: readonly Temporal.Instant[];
  // The bounty taken and not yet claimed, as the save holds it
  savedBountyHunt?: ReputationBountyHunt;
}

// The Mondstadt bounty the player has taken, in progress until its claim pays, and the moments of the bounty claims made.
// Both are the save's, so a reload finds the hunt and the week's count where they were left
export const useWorldReputationBounty = ({
  payReputationReward,
  random,
  reputation,
  reputationCity,
  savedBountyClaimedAts,
  savedBountyHunt,
}: Props) => {
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { worldLevel } = storeToRefs(worldAdventureRankStore);
  const worldSessionStore = useWorldSessionStore();
  const { events, getWorldNow } = worldSessionStore;
  const bountyHunt = shallowRef<ReputationBountyHunt | undefined>(savedBountyHunt);
  const bountyClaimedAts = shallowRef<readonly Temporal.Instant[]>(savedBountyClaimedAts);
  // The camp of the taken bounty while its target stands, made from the hunt once at the world level held then, so the enemy
  // Stays put as the hunt changes
  const bountyCamp = shallowRef<EnemyCamp | undefined>(
    savedBountyHunt && !savedBountyHunt.isTargetDefeated
      ? createReputationBountyCamp(savedBountyHunt, worldLevel.value)
      : undefined,
  );
  const bountyCamps = computed<EnemyCamp[]>(() =>
    bountyCamp.value && bountyHunt.value && !bountyHunt.value.isTargetDefeated ? [bountyCamp.value] : [],
  );
  // The ends the sight leads a trail to, the spot of each target standing in the world
  const bountyTrailEnds = computed(() => computeBountyTrailEnds(bountyCamps.value));
  // Takes one of the nation's bounties at random into a hunt, unless one is in progress
  const takeBounty = () => {
    const city = reputationCity.value;
    if (!city || bountyHunt.value || city.bounties.length === 0) return;
    const bounty = takeRandom(city.bounties, random);
    const hunt = takeReputationBounty(city, reputation.value.level, bounty.id, random());
    if (!hunt) return;
    bountyHunt.value = hunt;
    bountyCamp.value = createReputationBountyCamp(hunt, worldLevel.value);
  };
  // A defeat of the taken bounty's camp marks its target defeated, which the claim waits on
  events.on("defeatEnemy", (enemy) => {
    if (bountyHunt.value) bountyHunt.value = defeatReputationBountyTarget(bountyHunt.value, enemy.campId);
  });
  // The claim pays the bounty's reward once its target is defeated and the week's limit is not reached, and ends the hunt
  const claimBounty = () => {
    const city = reputationCity.value;
    const claim =
      city && bountyHunt.value
        ? claimWeeklyReputationBounty(city, bountyHunt.value, bountyClaimedAts.value, getWorldNow())
        : undefined;
    if (!claim) return;
    payReputationReward(claim.reward);
    bountyClaimedAts.value = claim.claimedAts;
    bountyHunt.value = undefined;
    bountyCamp.value = undefined;
  };
  const reputationBountyOffer = computed(() => {
    if (bountyHunt.value) return bountyHunt.value.isTargetDefeated ? ReputationBountyOffer.Claim : undefined;
    return reputation.value.level >= REPUTATION_OFFER_FIRST_LEVEL && (reputationCity.value?.bounties.length ?? 0) > 0
      ? ReputationBountyOffer.Offer
      : undefined;
  });
  return { bountyCamps, bountyClaimedAts, bountyHunt, bountyTrailEnds, claimBounty, reputationBountyOffer, takeBounty };
};
