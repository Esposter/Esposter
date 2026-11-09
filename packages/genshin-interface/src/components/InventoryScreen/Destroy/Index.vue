<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventoryQuickSelect } from "#src/models/InventoryQuickSelect";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The Destroy button that opens the dialog, and the dialog's own OK that destroys the chosen entries
  destroyButtonLabel: string;
  // The destroy mode's warning that the entry cannot be destroyed, shown on the chosen entry the bag never destroys
  destroyCannotLabel: string;
  // The names of the entries chosen for a destroy, which holds the button off while there are none
  destroyNames: string[];
  // The count beside the Destroy button, `{0}/{1} selected` filled in the reader's language
  destroySelectedLabel: string;
  // The destroy mode's opening line in the reader's language
  destroyTipLabel: string;
  // The destroy mode's quick selects on the open tab, each choosing every entry the bag may destroy of its rarity
  quickSelects: InventoryQuickSelect[];
  // The entry the detail panel shows, whose cannot-destroy warning shows when the bag never destroys it
  selectedCell?: InventoryCell;
}

defineProps<Props>();
const emit = defineEmits<{ destroy: []; quickSelect: [rarity: number] }>();
</script>

<template>
  <!-- The destroy mode's foot, in place of the sort or the currencies: its opening line, the quick selects by rarity,
       the count of the chosen entries and the Destroy button that opens the dialog. Provisional until the mode is recorded -->
  <section class="destroy">
    <p class="destroy-tip">{{ destroyTipLabel }}</p>
    <p v-if="selectedCell && !selectedCell.isDestroyable" class="destroy-cannot">{{ destroyCannotLabel }}</p>
    <ul class="quick-selects">
      <li v-for="{ label, rarity } of quickSelects" :key="rarity">
        <GameButton class="translucent-button" :kind="GameButtonKind.Row" tip="" @click="emit('quickSelect', rarity)">
          {{ label }}
        </GameButton>
      </li>
    </ul>
    <p class="destroy-count">{{ destroySelectedLabel }}</p>
    <GameButton
      class="destroy-button translucent-button"
      :disabled="!destroyNames.length"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('destroy')"
    >
      {{ destroyButtonLabel }}
    </GameButton>
  </section>
</template>

<style scoped>
/* The destroy mode's foot and dialog are placed in the game's 1080-high units by the recording, not yet measured, so
   they sit in the foot's band and the screen's centre until then: the count and the Destroy button share the quick
   selects' row, so the foot's three rows end above the screen's 1080 */
.destroy {
  position: absolute;
  top: calc(var(--unit) * 960);
  left: calc(var(--unit) * 230);
  right: calc(var(--unit) * 47);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--unit) * 12);
}

.destroy-tip,
.destroy-cannot {
  margin: 0;
  width: 100%;
}

.destroy-count {
  margin: 0;
}

.destroy-cannot {
  color: #ff9a7a;
}

.quick-selects {
  display: flex;
  gap: calc(var(--unit) * 10);
  margin: 0;
  padding: 0;
  list-style: none;
}

.destroy-button:disabled {
  opacity: 0.4;
}
</style>

<style scoped src="../../../styles/translucentButton.css"></style>
