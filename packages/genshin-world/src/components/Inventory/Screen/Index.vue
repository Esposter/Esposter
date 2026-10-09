<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { InventoryCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsInventoryItemDestroyable } from "#src/services/inventory/checkIsInventoryItemDestroyable";
import { computeInventoryTab } from "#src/services/inventory/computeInventoryTab";
import { EQUIPMENT_CATEGORIES, INVENTORY_CURRENCIES, PRECIOUS_CURRENCIES } from "#src/services/inventory/constants";
import { countCategoryPieces } from "#src/services/inventory/countCategoryPieces";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { CurrencyRarityMap } from "#src/services/inventory/CurrencyRarityMap";
import { destroyInventoryItems } from "#src/services/inventory/destroyInventoryItems";
import { DestroyQuickSelectGameTextKeyMap } from "#src/services/inventory/DestroyQuickSelectGameTextKeyMap";
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
const emit = defineEmits<{ close: []; "update:inventory": [inventory: Inventory] }>();
const category = ref(initialCategory);
const selectedId = ref("");
const isDestroying = ref(false);
const isConfirming = ref(false);
// The entries ticked for a destroy, by id, across the bag's tabs until the mode is left
const chosenIds = ref<string[]>([]);
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
const cells = computed((): InventoryCell[] => {
  const itemCells = computeInventoryTab(inventory.items, category.value, {
    isDescending: isDescending.value,
    sort: sort.value,
  }).map((item) => {
    const {
      definition: { name, rarity },
      id,
      level,
      quantity,
    } = item;
    let caption = String(quantity);
    if (level !== undefined)
      caption =
        category.value === ItemCategory.Weapon
          ? fillGameTextValues(gameText[GameTextKey.LevelFormat], level)
          : `+${level}`;
    return {
      caption,
      id: String(id),
      isDestroyable: checkIsInventoryItemDestroyable(item) || undefined,
      isSelected: chosenIds.value.includes(String(id)) || undefined,
      name,
      rarity,
    };
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
// The destroy mode's counts and names: the chosen entries across the bag, and the bag's entries it may destroy
const destroyableCount = computed(() => inventory.items.filter(checkIsInventoryItemDestroyable).length);
const destroySelectedLabel = computed(() =>
  fillGameTextValues(gameText[GameTextKey.InventoryDestroySelected], chosenIds.value.length, destroyableCount.value),
);
const chosenNames = computed(() =>
  inventory.items.filter(({ id }) => chosenIds.value.includes(String(id))).map(({ definition: { name } }) => name),
);
const quickSelects = computed(() =>
  (DestroyQuickSelectGameTextKeyMap[category.value] ?? []).map(({ gameTextKey, rarity }) => ({
    label: gameText[gameTextKey],
    rarity,
  })),
);
const toggleDestroy = () => {
  isDestroying.value = !isDestroying.value;
  chosenIds.value = [];
};
const chooseCell = (id: string) => {
  chosenIds.value = chosenIds.value.includes(id)
    ? chosenIds.value.filter((chosenId) => chosenId !== id)
    : [...chosenIds.value, id];
};
// Chooses every entry of the rarity the bag may destroy on the open tab, and keeps what is already chosen
const quickSelect = (rarity: number) => {
  const rarityIds = cells.value.filter((cell) => cell.isDestroyable && cell.rarity === rarity).map(({ id }) => id);
  chosenIds.value = [...new Set([...chosenIds.value, ...rarityIds])];
};
const confirmDestroy = () => {
  const ids = chosenIds.value.map(Number);
  emit("update:inventory", { ...inventory, items: destroyInventoryItems(inventory.items, ids) });
  isConfirming.value = false;
  isDestroying.value = false;
  chosenIds.value = [];
};
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
      :cancel-label="gameText[GameTextKey.Cancel]"
      :capacity
      :cells
      :currencies
      :destroy-button-label="gameText[GameTextKey.InventoryDestroyButton]"
      :destroy-cannot-label="gameText[GameTextKey.InventoryDestroyCannot]"
      :destroy-confirm-button-label="gameText[GameTextKey.InventoryDestroyConfirmButton]"
      :destroy-confirm-list-label="gameText[GameTextKey.InventoryDestroyConfirmList]"
      :destroy-confirm-title="gameText[GameTextKey.InventoryDestroyConfirmTitle]"
      :destroy-confirm-warning-label="gameText[GameTextKey.InventoryDestroyConfirmWarning]"
      :destroy-label="gameText[GameTextKey.InventoryDestroy]"
      :destroy-names="chosenNames"
      :destroy-selected-label
      :destroy-tip-label="gameText[GameTextKey.InventoryDestroyTip]"
      :is-confirming="isConfirming || undefined"
      :is-destroying="isDestroying || undefined"
      :is-sortable="EQUIPMENT_CATEGORIES.includes(category) || undefined"
      :order-label="gameText[isDescending ? GameTextKey.SortDescending : GameTextKey.SortAscending]"
      :quick-selects
      :sort-labels
      :tab-labels
      :title="gameText[GameTextKey.Inventory]"
      @cancel-destroy="isConfirming = false"
      @choose="(id) => chooseCell(id)"
      @close="emit('close')"
      @confirm-destroy="confirmDestroy()"
      @destroy="isConfirming = true"
      @quick-select="(rarity) => quickSelect(rarity)"
      @toggle-destroy="toggleDestroy()"
    />
  </GameScreen>
</template>
