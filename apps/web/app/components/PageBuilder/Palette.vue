<script setup lang="ts">
import { usePageBuilderInsert } from "@/composables/pageBuilder/usePageBuilderInsert";
import { WEBPAGE_NODE_TYPE_TITLE_MAP, WEBPAGE_PALETTE_CATEGORY_MAP } from "@/services/pageBuilder/constants";

interface Props {
  announce: (message: string) => void;
  resourceId: string;
}
const { announce, resourceId } = defineProps<Props>();
const { insert } = usePageBuilderInsert(() => resourceId, announce);
</script>

<template>
  <div flex flex-col gap-4>
    <section v-for="(types, category) of WEBPAGE_PALETTE_CATEGORY_MAP" :key="category" flex flex-col gap-2>
      <h3 text-sm text-muted>{{ category }}</h3>
      <div flex flex-wrap gap-2>
        <UiButton v-for="type of types" :key="type" @click="insert(type)">{{
          WEBPAGE_NODE_TYPE_TITLE_MAP[type]
        }}</UiButton>
      </div>
    </section>
  </div>
</template>
