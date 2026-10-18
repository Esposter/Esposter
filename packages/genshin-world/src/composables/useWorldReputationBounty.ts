import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { claimReputationBounty } from "#src/services/reputation/claimReputationBounty";
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
  worldLevel: Readonly<Ref<number>>;
}

// The Mondstadt bounty the player has taken, in progress until its claim pays. The hunt lives in the session, since no save
// Keeps one yet, and its target's camp is made once when the bounty is taken, so the enemy stays put as the hunt changes
export const useWorldReputationBounty = ({
  events,
  payReputationReward,
  random,
  reputation,
  reputationCity,
  worldLevel,
}: Props) => {
  const bountyHunt = shallowRef<ReputationBountyHunt>();
  const bountyCamp = shallowRef<EnemyCamp>();
  // The camp of the taken bounty while its target stands, which the world spawns at the hunt's spawn point
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
  // The claim pays the bounty's reward once its target is defeated, and ends the hunt
  const claimBounty = () => {
    const city = reputationCity.value;
    const reward = city && bountyHunt.value ? claimReputationBounty(city, bountyHunt.value) : undefined;
    if (!reward) return;
    payReputationReward(reward);
    bountyHunt.value = undefined;
    bountyCamp.value = undefined;
  };
  return { bountyCamps, bountyHunt, claimBounty, takeBounty };
};
