<script setup lang="ts">
import WeaponScreenCellsPick from "#src/components/Weapon/Screen/Cells/Pick/Index.vue";

interface Props {
  // The copies of the weapon the bag holds beside it, which the Refine tab offers, each with its name and level
  copyCells: { id: number; levelText: string; name: string }[];
  // Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
  isRefinementMaterialHeld: boolean;
  // The copy the Refine tab picked, which stands in for the material when it is set
  pickedCopyId?: number;
  // The refinement material the Refine tab offers, with the count the bag holds of it
  refinementMaterial?: { count: number; name: string };
}

const { copyCells, isRefinementMaterialHeld, pickedCopyId, refinementMaterial } = defineProps<Props>();
const emit = defineEmits<{ pickCopy: [id: number]; pickMaterial: [] }>();
</script>

<template>
  <div v-if="refinementMaterial && isRefinementMaterialHeld" class="cell">
    <WeaponScreenCellsPick
      :caption="refinementMaterial.count"
      :is-pressed="pickedCopyId === undefined"
      :name="refinementMaterial.name"
      @pick="emit('pickMaterial')"
    />
  </div>
  <div v-for="copy of copyCells" :key="copy.id" class="cell">
    <WeaponScreenCellsPick
      :caption="copy.levelText"
      :is-pressed="pickedCopyId === copy.id"
      :name="copy.name"
      @pick="emit('pickCopy', copy.id)"
    />
  </div>
</template>

<style scoped src="../../../../../styles/weaponCells.css"></style>
