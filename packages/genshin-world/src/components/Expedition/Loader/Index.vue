<script setup lang="ts">
import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";
import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { GameText } from "genshin-text";

import ExpeditionScreen from "#src/components/Expedition/Screen/Index.vue";
import { MONDSTADT_EXPEDITION_PIN_LAYOUT } from "#src/services/expedition/constants";
import { readExpeditionLimitAdds } from "#src/services/expedition/readExpeditionLimitAdds";
import { readExpeditionPassives } from "#src/services/expedition/readExpeditionPassives";
import { readMondstadtExpeditionPlaces } from "#src/services/expedition/readMondstadtExpeditionPlaces";

interface Props {
  adventureRank: number;
  // The characters the picker lists in the game's order, each by its id and its name in the reader's language
  characters: { id: number; name: string }[];
  // The proud skill groups each character has unlocked, by character id, which picks its expedition talents
  characterPassiveGroupIdMap: ReadonlyMap<number, ReadonlySet<number>>;
  completedQuestIds: ReadonlySet<string>;
  downCharacterIds: ReadonlySet<number>;
  // The hosted game data's base, which the expedition places and the limit's steps are read from
  gameDataBaseUrl: string;
  gameText: GameText;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  now: Temporal.Instant;
  random: () => number;
  // The Statues of The Seven the save holds, by region, which the places they open are read from
  regionStatueProgressMap: ReadonlyMap<string, StatueRegionProgressSave>;
}

const expeditions = defineModel<Expedition[]>("expeditions", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const {
  adventureRank,
  characterPassiveGroupIdMap,
  characters,
  completedQuestIds,
  downCharacterIds,
  gameDataBaseUrl,
  gameText,
  materialDataMap,
  nameText,
  now,
  random,
  regionStatueProgressMap,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const statueRegions = computed(() => Object.fromEntries(regionStatueProgressMap));
// The places and the limit's steps are read when the screen opens, and the screen is drawn once both have arrived
const places = ref<ExpeditionPlace[]>();
const expeditionLimitAdds = ref<ExpeditionLimitAdd[]>();
// Each character's expedition talents, read when the screen opens, so the screen sees the talents of the one sent
const characterExpeditionPassives = ref<ReadonlyMap<number, ExpeditionPassive[]>>();
// Each place's pin takes its position in the order the table holds the places, and a place past the last position is not drawn
const pinPositions = computed(
  () =>
    new Map(
      MONDSTADT_EXPEDITION_PIN_LAYOUT.flatMap((position, index) => {
        const place = places.value?.[index];
        return place ? [[place.id, position] as const] : [];
      }),
    ),
);

onMounted(async () => {
  const [loadedPlaces, loadedLimitAdds, loadedPassives] = await Promise.all([
    readMondstadtExpeditionPlaces(gameDataBaseUrl),
    readExpeditionLimitAdds(gameDataBaseUrl),
    readExpeditionPassives(gameDataBaseUrl),
  ]);
  places.value = loadedPlaces;
  expeditionLimitAdds.value = loadedLimitAdds;
  characterExpeditionPassives.value = new Map(
    [...characterPassiveGroupIdMap].map(([characterId, groupIds]) => [
      characterId,
      loadedPassives.filter(({ proudSkillGroupId }) => groupIds.has(proudSkillGroupId)),
    ]),
  );
});
</script>

<template>
  <ExpeditionScreen
    v-if="places && expeditionLimitAdds && characterExpeditionPassives"
    v-model:expeditions="expeditions"
    v-model:inventory="inventory"
    v-model:wallet="wallet"
    :adventure-rank="adventureRank"
    :character-expedition-passives="characterExpeditionPassives"
    :characters
    :completed-quest-ids="completedQuestIds"
    :down-character-ids="downCharacterIds"
    :expedition-limit-adds="expeditionLimitAdds"
    :game-text
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :now
    :pin-positions="pinPositions"
    :places
    :random
    :statue-regions="statueRegions"
    @close="emit('close')"
  />
</template>
