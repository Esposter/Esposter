<script setup lang="ts">
import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionContext } from "#src/models/expedition/ExpeditionContext";
import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";
import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { StatueProgressSave } from "#src/models/statue/StatueProgressSave";
import type { ExpeditionCharacter, ExpeditionNation, ExpeditionPin, ExpeditionPlaceDetail } from "genshin-interface";
import type { GameText } from "genshin-text";

import { checkIsExpeditionPlaceOpen } from "#src/services/expedition/checkIsExpeditionPlaceOpen";
import { checkIsExpeditionReturned } from "#src/services/expedition/checkIsExpeditionReturned";
import { claimExpedition } from "#src/services/expedition/claimExpedition";
import { computeExpeditionLimit } from "#src/services/expedition/computeExpeditionLimit";
import { computeExpeditionPassives } from "#src/services/expedition/computeExpeditionPassives";
import { recallExpedition } from "#src/services/expedition/recallExpedition";
import { sendExpedition } from "#src/services/expedition/sendExpedition";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { computeUnlockedStatuePointIds } from "#src/services/statue/computeUnlockedStatuePointIds";
import { ExpeditionActionKind, ExpeditionScreen, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  adventureRank: number;
  // The characters the picker lists, each by its id and its name in the reader's language
  characters: { id: number; name: string }[];
  completedQuestIds: ReadonlySet<string>;
  // The characters who are down, whom no expedition is sent with
  downCharacterIds: ReadonlySet<number>;
  // The Adventure Rank steps of the expedition limit, from the game's player level table
  expeditionLimitAdds: ExpeditionLimitAdd[];
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, whose rarity colours each reward's slot
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The moment the expeditions are read at, so each one's return is read from this moment
  now: Temporal.Instant;
  // Each place's pin at 1080 high in the frame, by its id; a place with no position is not drawn
  pinPositions: ReadonlyMap<number, { x: number; y: number }>;
  // The expedition talents each character has unlocked, by character id, which shorten its expeditions and add to their rewards
  characterExpeditionPassives: ReadonlyMap<number, readonly ExpeditionPassive[]>;
  // Mondstadt's expedition places as the game's tables hold them
  places: ExpeditionPlace[];
  // The world's seeded random source, which each claim's counts are drawn from
  random: () => number;
  // The Statues of The Seven the save holds, whose resonated regions open the places their statues name
  statueRegions: StatueProgressSave["regions"];
}

const expeditions = defineModel<Expedition[]>("expeditions", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const {
  adventureRank,
  characterExpeditionPassives,
  characters,
  completedQuestIds,
  downCharacterIds,
  expeditionLimitAdds,
  gameText,
  materialDataMap,
  nameText,
  now,
  pinPositions,
  places,
  random,
  statueRegions,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const hours = defineModel<number>("hours", { default: 0 });
const picking = defineModel<boolean>("picking", { default: false });
const place = defineModel<number | undefined>("place");
const nation = ref(gameText[GameTextKey.Mondstadt]);
// The expedition context read off the player's progress now, the character on the send added where one is sent
const context = computed<ExpeditionContext>(() => ({
  adventureRank,
  completedQuestIds,
  expeditionLimit: computeExpeditionLimit(adventureRank, expeditionLimitAdds),
  isCharacterDown: false,
  now,
  unlockedStatuePointIds: computeUnlockedStatuePointIds(statueRegions),
}));
const openPlaces = computed(() =>
  places.filter((candidate) => pinPositions.has(candidate.id) && checkIsExpeditionPlaceOpen(candidate, context.value)),
);
const getExpeditionAt = (placeId: number): Expedition | undefined =>
  expeditions.value.find((expedition) => expedition.placeId === placeId);
const pickedPlace = computed(() => openPlaces.value.find(({ id }) => id === place.value));
const pickedExpedition = computed(() => (pickedPlace.value ? getExpeditionAt(pickedPlace.value.id) : undefined));
// An expedition returned is claimed and one still out is recalled, while a place with none out is sent to
// The talents of the character sent shorten the time it takes in the place's region, so the return is read with them
const getActionKind = (expeditionPlace: ExpeditionPlace, expedition: Expedition | undefined): ExpeditionActionKind => {
  if (!expedition) return ExpeditionActionKind.Send;
  const { timeReductionPercent } = computeExpeditionPassives(
    characterExpeditionPassives.get(expedition.characterId) ?? [],
    expeditionPlace.region,
    expedition.hours,
  );
  return checkIsExpeditionReturned(expedition, now, timeReductionPercent)
    ? ExpeditionActionKind.Claim
    : ExpeditionActionKind.Recall;
};
const actionLabels: Record<ExpeditionActionKind, string> = {
  [ExpeditionActionKind.Claim]: gameText[GameTextKey.ExpeditionClaim],
  [ExpeditionActionKind.Recall]: gameText[GameTextKey.ExpeditionRecall],
  [ExpeditionActionKind.Send]: gameText[GameTextKey.ExpeditionSelectCharacter],
};
const pins = computed<ExpeditionPin[]>(() =>
  openPlaces.value.map(({ id, nameTextId }) => ({
    awayLabel: getExpeditionAt(id) ? gameText[GameTextKey.ExpeditionExploring] : "",
    id,
    label: gameText[nameTextId],
    x: pinPositions.get(id)?.x ?? 0,
    y: pinPositions.get(id)?.y ?? 0,
  })),
);
const detail = computed<ExpeditionPlaceDetail | undefined>(() => {
  const picked = pickedPlace.value;
  if (!picked) return undefined;
  const expedition = pickedExpedition.value;
  const actionKind = getActionKind(picked, expedition);
  const duration = picked.durations.find(({ hours: durationHours }) => durationHours === hours.value);
  return {
    actionKind,
    actionLabel: actionLabels[actionKind],
    // The picked place's description is not in the expedition record, so the panel draws none until the record holds it
    description: "",
    durations: expedition ? [] : picked.durations.map(({ hours: durationHours }) => durationHours),
    id: picked.id,
    name: gameText[picked.nameTextId],
    rewards: (duration?.items ?? []).map(({ itemId, maxCount, minCount }) => {
      const { name, rarity } = getItemDefinition(itemId, nameText, materialDataMap);
      return { countLabel: `${minCount}~${maxCount}`, label: name, rarity };
    }),
    statusLabel: expedition ? gameText[GameTextKey.ExpeditionExploring] : "",
  };
});
const pickerCharacters = computed<ExpeditionCharacter[]>(() =>
  characters.map(({ id, name }) => ({
    bonusLabel: gameText[GameTextKey.ExpeditionNoBonus],
    id,
    label: name,
    statusLabel: expeditions.value.some((expedition) => expedition.characterId === id)
      ? gameText[GameTextKey.ExpeditionExploring]
      : "",
  })),
);
const nations = computed<ExpeditionNation[]>(() => [{ hasAlert: false, name: gameText[GameTextKey.Mondstadt] }]);
// A send takes the character picked on the place's duration, a recall takes the expedition away, and a claim takes its
// Reward into the bag and the wallet when the bag takes every item whole
const send = (placeId: number, characterId: number, sentHours: number) => {
  const target = openPlaces.value.find(({ id }) => id === placeId);
  if (!target) return;
  const sent = sendExpedition(expeditions.value, characterId, target, sentHours, {
    ...context.value,
    isCharacterDown: downCharacterIds.has(characterId),
  });
  if (sent) expeditions.value = sent;
};
const recall = (placeId: number) => {
  const expedition = getExpeditionAt(placeId);
  if (expedition) expeditions.value = recallExpedition(expeditions.value, expedition.characterId);
};
const claim = (placeId: number) => {
  const target = openPlaces.value.find(({ id }) => id === placeId);
  const expedition = getExpeditionAt(placeId);
  if (!target || !expedition) return;
  const claimed = claimExpedition(
    expeditions.value,
    expedition.characterId,
    target,
    inventory.value,
    wallet.value,
    nameText,
    materialDataMap,
    now,
    random,
    characterExpeditionPassives.get(expedition.characterId) ?? [],
  );
  if (!claimed) return;
  expeditions.value = claimed.expeditions;
  inventory.value = claimed.inventory;
  wallet.value = claimed.wallet;
};
</script>

<template>
  <!-- The expedition screen opened over the world by Katheryne's talk: the places open to Mondstadt's map as pins with
       the expedition away from each, the picked place's panel and its action, and the character picker a send opens -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ExpeditionTitle]">
    <ExpeditionScreen
      v-model:hours="hours"
      v-model:nation="nation"
      v-model:picking="picking"
      v-model:place="place"
      :character-title="gameText[GameTextKey.ExpeditionCharacterSelection]"
      :characters="pickerCharacters"
      :close-label="gameText[GameTextKey.Back]"
      :detail
      :limit-label="
        fillGameTextValues(gameText[GameTextKey.ExpeditionLimit], expeditions.length, context.expeditionLimit)
      "
      :nations
      :pins
      :rewards-label="gameText[GameTextKey.ExpeditionRewards]"
      :title="gameText[GameTextKey.ExpeditionTitle]"
      @claim="(placeId) => claim(placeId)"
      @close="emit('close')"
      @recall="(placeId) => recall(placeId)"
      @send="(placeId, characterId, hours) => send(placeId, characterId, hours)"
    />
  </GameScreen>
</template>
