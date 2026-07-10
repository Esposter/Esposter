<script setup lang="ts">
import { useRowStore } from "@/store/resource/file/row";

const rowStore = useRowStore();
const { copyIncludesHeaders } = storeToRefs(rowStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :icon="copyIncludesHeaders ? 'mdi-table-headers-eye' : 'mdi-table-headers-eye-off'"
    :text="copyIncludesHeaders ? 'Headers included in copy' : 'Headers excluded from copy'"
    @click="copyIncludesHeaders = !copyIncludesHeaders"
  />
</template>
