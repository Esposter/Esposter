<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { computeInventoryTab } from "#src/services/inventory/computeInventoryTab";
import { EQUIPMENT_CATEGORIES, INVENTORY_CURRENCIES, PRECIOUS_CURRENCIES } from "#src/services/inventory/constants";
import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { CurrencyRarityMap } from "#src/services/inventory/CurrencyRarityMap";
import { InventorySortGameTextKeyMap } from "#src/services/inventory/InventorySortGameTextKeyMap";
import { ItemCategoryGameTextKeyMap } from "#src/services/inventory/ItemCategoryGameTextKeyMap";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { GameScreen, InventoryScreen, InventorySort, ItemCategories, ItemCategory } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The tab the bag opens on
  initialCategory: ItemCategory;
  inventory: Inventory;
  wallet: Wallet;
}

const { gameText, initialCategory, inventory, wallet } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const category = ref(initialCategory);
const selectedId = ref("");
const sort = ref(InventorySort.Level);
const isDescending = ref(true);
const tabLabels = computed(() =>
  Object.fromEntries(
    ItemCategories.map((itemCategory) => [itemCategory, gameText[ItemCategoryGameTextKeyMap[itemCategory]]]),
  ),
);
const sortLabels = computed(() => ({
  [InventorySort.Level]: gameText[InventorySortGameTextKeyMap[InventorySort.Level]],
  [InventorySort.Quality]: gameText[InventorySortGameTextKeyMap[InventorySort.Quality]],
}));
// A tab counted on its own shows its room as the game words it, its name, its count and its limit
const capacity = computed(() => {
  const room = ItemCategoryRoomMap[category.value];
  return room === undefined
    ? ""
    : fillGameTextValues(
        gameText[GameTextKey.InventoryCapacity],
        tabLabels.value[category.value],
        countCategoryPieces(inventory.items, category.value),
        room,
      );
});
// The open tab's entries, a weapon's level as the game writes one and an artifact's as its plus, a stack's count, and on
// Precious Items the wish's currencies the player holds ahead of the bag's own
const cells = computed(() => {
  const itemCells = computeInventoryTab(inventory.items, category.value, {
    isDescending: isDescending.value,
    sort: sort.value,
  }).map(({ definition: { name, rarity }, id, level, quantity }) => {
    let caption = String(quantity);
    if (level !== undefined)
      caption =
        category.value === ItemCategory.Weapon
          ? fillGameTextValues(gameText[GameTextKey.LevelFormat], level)
          : `+${level}`;
    return { caption, id: String(id), name, rarity };
  });
  if (category.value !== ItemCategory.PreciousItem) return itemCells;
  const currencyCells = PRECIOUS_CURRENCIES.filter((currency) => wallet[currency] > 0).map((currency) => ({
    caption: String(wallet[currency]),
    id: currency,
    name: gameText[CurrencyGameTextKeyMap[currency]],
    rarity: CurrencyRarityMap[currency],
  }));
  return [...currencyCells, ...itemCells];
});
const currencies = computed(() =>
  INVENTORY_CURRENCIES.map((currency) => ({
    id: currency,
    isTopUp: currency === Currency.Primogem || undefined,
    name: gameText[CurrencyGameTextKeyMap[currency]],
    quantity: wallet[currency],
  })),
);
</script>

<template>
  <!-- The bag, opened by B or the Paimon menu: the tab open first is the weapons', sorted by level from the highest -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Inventory]">
    <InventoryScreen
      v-model:category="category"
      v-model:is-descending="isDescending"
      v-model:sort="sort"
      v-model:selected-id="selectedId"
      :back-label="gameText[GameTextKey.Back]"
      :capacity
      :cells
      :currencies
      :is-sortable="EQUIPMENT_CATEGORIES.includes(category) || undefined"
      :order-label="gameText[isDescending ? GameTextKey.SortDescending : GameTextKey.SortAscending]"
      :sort-labels
      :tab-labels
      :title="gameText[GameTextKey.Inventory]"
      @close="emit('close')"
    />
  </GameScreen>
</template>
