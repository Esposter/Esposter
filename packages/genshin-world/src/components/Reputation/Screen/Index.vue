<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationLevelCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { ReputationFunctionGameTextKeyMap } from "#src/services/reputation/ReputationFunctionGameTextKeyMap";
import { takeOne } from "@esposter/shared";
import { GameScreen, ReputationScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, whose rarity colours each reward's slot
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The bounty the keeper offers ahead of her request: its claim once its target is defeated, or one to take
  bountyOffer?: ReputationBountyOffer;
  // The request the keeper offers, its title in the reader's language, or none where she offers none
  offerTitle?: string;
  // The nation's Reputation the player holds: its level, and the EXP toward the next
  progress: ReputationProgress;
  // The nation's levels and their rewards, as the game's table gives them
  reputation: ReputationCity;
}

const { bountyOffer, gameText, materialDataMap, nameText, offerTitle, progress, reputation } = defineProps<Props>();
const emit = defineEmits<{ accept: []; close: [] }>();
const level = defineModel<number>("level", { required: true });
// A level is achieved once the nation's Reputation has reached it, and its unlock line is the feature it opens in the
// Game's words. Each item's slot is read aloud as its name and count; the words its achieved mark is read aloud with wait
// On game text naming it
const levels = computed<ReputationLevelCell[]>(() =>
  reputation.levels.map(({ functionIds, level: cellLevel, reward }) => ({
    isAchieved: cellLevel <= progress.level,
    items: reward.items.map(({ count, id }) => {
      const { name, rarity } = getItemDefinition(id, nameText, materialDataMap);
      return { count, label: fillGameTextValues(gameText[GameTextKey.ItemCount], name, count), rarity };
    }),
    level: cellLevel,
    unlockLabel: functionIds
      .map((functionId) => gameText[takeOne(ReputationFunctionGameTextKeyMap, functionId)])
      .join(" "),
  })),
);
// The offer the keeper shows, its bounty's title and button's words in the game's, else her request's in the reader's
const offer = computed(() => {
  if (bountyOffer === ReputationBountyOffer.Claim)
    return { acceptLabel: gameText[GameTextKey.BountyClaim], title: gameText[GameTextKey.BountyCompleted] };
  if (bountyOffer === ReputationBountyOffer.Offer)
    return { acceptLabel: gameText[GameTextKey.BountyAccept], title: gameText[GameTextKey.BountyOffer] };
  return offerTitle ? { acceptLabel: gameText[GameTextKey.ReputationRequestAccept], title: offerTitle } : undefined;
});
</script>

<template>
  <!-- The reward page, opened over the world by the nation's keeper: the title names the nation, each level lists its
       items by their rarity, the feature it unlocks and whether it is achieved. The picked level's name and requirement
       wait on the game's own choice of which item it names and its requirement's words -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.CityReputation]">
    <ReputationScreen
      v-model:level="level"
      achieved-label=""
      :back-label="gameText[GameTextKey.Back]"
      headline=""
      :level-label="gameText[GameTextKey.LevelShort]"
      :levels
      :not-achieved-label="gameText[GameTextKey.ReputationNotAchieved]"
      :offer
      :requirement="[]"
      :title="fillGameTextValues(gameText[GameTextKey.ReputationReward], gameText[GameTextKey.Mondstadt])"
      @accept="emit('accept')"
      @close="emit('close')"
    />
  </GameScreen>
</template>
