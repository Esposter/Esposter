<script setup lang="ts">
import WeaponScreenCellsEnhance from "#src/components/Weapon/Screen/Cells/Enhance/Index.vue";
import WeaponScreenCellsRefine from "#src/components/Weapon/Screen/Cells/Refine/Index.vue";
import { ENHANCE_SLOT_COUNT } from "#src/services/weapon/constants";
import { WeaponMenuTab } from "genshin-interface";

interface Props {
  // The copies of the weapon the bag holds beside it, which the Refine tab offers, each with its name and level
  copyCells: { id: number; levelText: string; name: string }[];
  // The bag's other weapons the Enhance tab offers as fodder, each with its name, its level and whether it is picked
  fodderCells: { id: number; levelText: string; name: string; picked: boolean }[];
  // Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
  isRefinementMaterialHeld: boolean;
  // The tab the panel is drawn for: the Enhance strip of ores and fodder, or the Refine tab's material and copies
  openTab: WeaponMenuTab;
  // The ores the Enhance tab offers, each with the count the bag holds and the count the player picked
  oreCells: { id: number; name: string; ownedCount: number; pickedCount: number }[];
  // The copy the Refine tab picked, which stands in for the material when it is set
  pickedCopyId?: number;
  // The refinement material the Refine tab offers, with the count the bag holds of it
  refinementMaterial?: { count: number; name: string };
  // The ranks a weapon can still gain, each one a slot on the Refine tab
  refineSlotCount: number;
}

const {
  copyCells,
  fodderCells,
  isRefinementMaterialHeld,
  openTab,
  oreCells,
  pickedCopyId,
  refinementMaterial,
  refineSlotCount,
} = defineProps<Props>();
const emit = defineEmits<{
  pickCopy: [id: number];
  pickMaterial: [];
  pickOre: [id: number];
  toggleFodder: [id: number];
  unpickOre: [id: number];
}>();
// The slots left empty after the open tab's candidates: the Enhance strip's seven, the seventh cut off at its right edge
// As the game's strip cuts it, and the Refine tab's rank slots that no candidate has taken
const emptySlotCount = computed(() =>
  openTab === WeaponMenuTab.Enhance
    ? Math.max(0, ENHANCE_SLOT_COUNT - oreCells.length - fodderCells.length)
    : Math.max(0, refineSlotCount - copyCells.length - (isRefinementMaterialHeld ? 1 : 0)),
);
</script>

<template>
  <div class="cells" :class="openTab === WeaponMenuTab.Enhance ? 'enhance-cells' : 'refine-cells'">
    <WeaponScreenCellsEnhance
      v-if="openTab === WeaponMenuTab.Enhance"
      :fodder-cells="fodderCells"
      :ore-cells="oreCells"
      @pick-ore="(id) => emit('pickOre', id)"
      @toggle-fodder="(id) => emit('toggleFodder', id)"
      @unpick-ore="(id) => emit('unpickOre', id)"
    />
    <WeaponScreenCellsRefine
      v-else
      :copy-cells="copyCells"
      :is-refinement-material-held="isRefinementMaterialHeld"
      :picked-copy-id="pickedCopyId"
      :refinement-material="refinementMaterial"
      @pick-copy="(id) => emit('pickCopy', id)"
      @pick-material="emit('pickMaterial')"
    />
    <div v-for="slot in emptySlotCount" :key="slot" class="cell">
      <span class="pick" aria-hidden="true">
        <span class="plus" />
        <span class="caption">--</span>
      </span>
    </div>
  </div>
</template>

<style scoped src="../../../../styles/weaponCells.css"></style>

<style scoped>
/* Enhance's panel: a strip of slots, each a grey card over the cream band its count sits on, the ores first */
.cells {
  position: absolute;
  display: flex;
  overflow: hidden;
}

.enhance-cells {
  top: calc(var(--reference-pixel) * 600);
  left: calc(var(--reference-pixel) * 1104);
  width: calc(var(--reference-pixel) * 714);
  height: calc(var(--reference-pixel) * 122);
  gap: calc(var(--reference-pixel) * 13);
}

.refine-cells {
  top: calc(var(--reference-pixel) * 604);
  left: calc(var(--reference-pixel) * 1222);
  gap: calc(var(--reference-pixel) * 18);
}
</style>
