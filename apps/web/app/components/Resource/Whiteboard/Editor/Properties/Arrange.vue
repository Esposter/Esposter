<script setup lang="ts">
import { useWhiteboardSelectionOperations } from "#src/composables/whiteboard/useWhiteboardSelectionOperations";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { DistributeAxis } from "#src/models/whiteboard/DistributeAxis";
import { WHITEBOARD_ALIGN_ITEMS } from "#src/services/whiteboard/arrange/constants";
import { getAlignOperations } from "#src/services/whiteboard/arrange/getAlignOperations";
import { getDistributeOperations } from "#src/services/whiteboard/arrange/getDistributeOperations";

// The align and distribute controls of a selection. Each is one commit, so one undo step, and each is disabled when it would move nothing: below its
// Minimum number of boxes, since an arrow and a stroke are not moved by either, or when the boxes already lie as it would put them
const { checkIsDisabled: checkIsAlignDisabled, commit: align } = useWhiteboardSelectionOperations(getAlignOperations);
const { checkIsDisabled: checkIsDistributeDisabled, commit: distribute } =
  useWhiteboardSelectionOperations(getDistributeOperations);
</script>

<template>
  <div flex flex-col gap-1>
    <div flex gap-1>
      <UiIconButton
        v-for="{ edge, label, meaning } in WHITEBOARD_ALIGN_ITEMS"
        :key="edge"
        :disabled="checkIsAlignDisabled(edge)"
        :label
        :meaning
        @click="align(edge)"
      />
    </div>
    <div flex gap-1>
      <UiIconButton
        label="Distribute horizontally"
        :meaning="UiIconMeaning.DistributeHorizontally"
        :disabled="checkIsDistributeDisabled(DistributeAxis.Horizontal)"
        @click="distribute(DistributeAxis.Horizontal)"
      />
      <UiIconButton
        label="Distribute vertically"
        :meaning="UiIconMeaning.DistributeVertically"
        :disabled="checkIsDistributeDisabled(DistributeAxis.Vertical)"
        @click="distribute(DistributeAxis.Vertical)"
      />
    </div>
  </div>
</template>
