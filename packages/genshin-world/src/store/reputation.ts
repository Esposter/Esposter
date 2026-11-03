import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { addReputationExp } from "#src/services/reputation/addReputationExp";
import { getFinishedReputationRewards } from "#src/services/reputation/getFinishedReputationRewards";
import { getReputationRequestBindings } from "#src/services/reputation/getReputationRequestBindings";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { recordWeeklyReputationClaim } from "#src/services/reputation/recordWeeklyReputationClaim";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction, InvalidOperationError, Operation } from "@esposter/shared";
import { defineStore } from "pinia";
import { shallowRef, watch } from "vue";

// Mondstadt's Reputation: the level and EXP the player holds, the city's levels, bounties and requests read as the world
// Opens, and the request claims the week holds. A reward pays its EXP at the city's levels and its items into the wallet,
// And a finished quest pays the Reputation request or Reputation quest it is, once. The session starts it after the
// Session store and stops it as it unmounts
export const useWorldReputationStore = defineStore("world/reputation", () => {
  const worldSessionStore = useWorldSessionStore();
  const { events, getWorldNow, setWallet } = worldSessionStore;
  const reputation = shallowRef<ReputationProgress>({ exp: 0, level: 1 });
  // Mondstadt's Reputation, read as the world opens: its levels, bounties and requests, and the exploration thresholds a
  // Statue's unlock can pass
  const reputationCity = shallowRef<ReputationCity>();
  // The request claims the week holds, the newest the limit's size: the keeper offers no request past the limit, and a
  // Request taken before it still pays when it finishes
  const requestClaimedAts = shallowRef<readonly Temporal.Instant[]>([]);
  // A Reputation reward pays its EXP at the city's levels and its items into the wallet, the one payment both the
  // Exploration thresholds and the finished requests make
  const payReputationReward = ({ exp, items }: ReputationReward) => {
    if (!reputationCity.value) return;
    reputation.value = addReputationExp(reputation.value, exp, reputationCity.value.levels);
    const nextWallet = { ...worldSessionStore.wallet };
    for (const { count, id } of items) {
      const currency = getWalletCurrency(id);
      if (currency === undefined) throw new InvalidOperationError(Operation.Update, "reputation reward", String(id));
      nextWallet[currency] += count;
    }
    setWallet(nextWallet);
  };
  // A request's reward pays once it finishes, past the week's limit too: the limit is held at the keeper's offer, so a
  // Request taken before the limit is not withheld, and its claim is recorded with the week's
  const payRequestReward = (reward: ReputationReward) => {
    requestClaimedAts.value = recordWeeklyReputationClaim(requestClaimedAts.value, getWorldNow());
    payReputationReward(reward);
  };
  // A finished quest pays the Reputation request or Reputation quest it is, once: the event is emitted on the move
  // That finishes it, and each request binds its quest once, so a quest the groups repeat pays its first row's
  // Reward. A quest finished before the Reputation has loaded is paid once it has, as the event is not emitted again
  let unpaidQuestFinishes: ((city: ReputationCity) => void)[] = [];
  watch(reputationCity, (city) => {
    if (!city) return;
    const pendingQuestFinishes = unpaidQuestFinishes;
    unpaidQuestFinishes = [];
    for (const payQuestFinish of pendingQuestFinishes) payQuestFinish(city);
  });
  const start = (saved: { reputation: ReputationProgress; requestClaimedAts: readonly Temporal.Instant[] }) => {
    reputation.value = saved.reputation;
    requestClaimedAts.value = saved.requestClaimedAts;
    events.on("finishQuest", (quest, progress, nextProgress) => {
      const payQuestFinish = (city: ReputationCity) => {
        for (const reward of getFinishedReputationRewards(quest, progress, nextProgress, city.quests))
          payReputationReward(reward);
        const requestBindings = getReputationRequestBindings(city.requests);
        for (const reward of getFinishedReputationRewards(quest, progress, nextProgress, requestBindings))
          payRequestReward(reward);
      };
      if (reputationCity.value) payQuestFinish(reputationCity.value);
      else unpaidQuestFinishes.push(payQuestFinish);
    });
    getSynchronizedFunction(() =>
      getResultAsync(() => readMondstadtReputation(worldSessionStore.gameDataBaseUrl)).match(
        (city) => {
          reputationCity.value = city;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  };
  const stop = () => {
    reputation.value = { exp: 0, level: 1 };
    reputationCity.value = undefined;
    requestClaimedAts.value = [];
    unpaidQuestFinishes = [];
  };

  return { payReputationReward, reputation, reputationCity, requestClaimedAts, start, stop };
});
