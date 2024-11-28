<script setup lang="ts">
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { ITEM_ID_QUERY_PARAM_KEY, ITEM_TYPE_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { uuidValidateV4 } from "@esposter/shared";

defineRouteRules({ ssr: false });

await useReadDashboard();
const route = useRoute();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const { visualType } = storeToRefs(visualStore);

onMounted(async () => {
  const itemType = route.query[ITEM_TYPE_QUERY_PARAM_KEY];
  if (Object.values(VisualType).some((type) => type === itemType)) visualType.value = itemType as VisualType;

  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) await editItem(itemId);
});
</script>

<template>
  <NuxtLayout>
    <v-container h-full fluid>
      <StyledCard flex="!" flex-col size-full>
        <DashboardEditorHeader />
        <DashboardEditorContent />
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>
