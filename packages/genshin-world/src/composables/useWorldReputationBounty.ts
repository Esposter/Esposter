import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { claimWeeklyReputationBounty } from "#src/services/reputation/claimWeeklyReputationBounty";
import { createReputationBountyCamp } from "#src/services/reputation/createReputationBountyCamp";
import { defeatReputationBountyTarget } from "#src/services/reputation/defeatReputationBountyTarget";
import { takeReputationBounty } from "#src/services/reputation/takeReputationBounty";
import { takeOne } from "@esposter/shared";
import { computed, shallowRef } from "vue";

interface Props {
  events: WorldEvents;
  payReputationReward: (reward: ReputationReward) => void;
  random: () => number;
  reputation: Readonly<Ref<ReputationProgress>>;
  reputationCity: Readonly<Ref<ReputationCity | undefined>>;
  // The moments of the bounty claims the save holds, those before the week's reset no longer counted
  savedBountyClaimedAts: readonly Temporal.Instant[];
  // The bounty taken and not yet claimed, as the save holds it
  savedBountyHunt: ReputationBountyHunt | undefined;
  worldLevel: Readonly<Ref<number>>;
}

// The Mondstadt bounty the player has taken, in progress until its claim pays, and the moments of the bounty claims made.
// Both are the save's, so a reload finds the hunt and the week's count where they were left
export const useWorldReputationBounty = ({
  events,
  payReputationReward,
  random,
  reputation,
  reputationCity,
  savedBountyClaimedAts,
  savedBountyHunt,
  worldLevel,
}: Props) => {
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
  // Takes one of the nation's bounties at random into a hunt, unless one is in progress
  const takeBounty = () => {
    const city = reputationCity.value;
    if (!city || bountyHunt.value || city.bounties.length === 0) return;
    const bounty = takeOne(city.bounties, Math.floor(random() * city.bounties.length));
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
        ? claimWeeklyReputationBounty(city, bountyHunt.value, bountyClaimedAts.value, Temporal.Now.instant())
        : undefined;
    if (!claim) return;
    payReputationReward(claim.reward);
    bountyClaimedAts.value = claim.claimedAts;
    bountyHunt.value = undefined;
    bountyCamp.value = undefined;
  };
  return { bountyCamps, bountyClaimedAts, bountyHunt, claimBounty, takeBounty };
};
