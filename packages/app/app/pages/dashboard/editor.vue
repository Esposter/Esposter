<script setup lang="ts">
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { ID_QUERY_PARAMETER_KEY, ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { uuidValidateV4 } from "@esposter/shared";

defineRouteRules({ ssr: false });

await useReadDashboard();
const route = useRoute();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const { visualType } = storeToRefs(visualStore);
const itemType = route.query[ITEM_TYPE_QUERY_PARAMETER_KEY];
if (Object.values(VisualType).some((type) => type === itemType)) visualType.value = itemType as VisualType;
const itemId = route.query[ID_QUERY_PARAMETER_KEY];
if (typeof itemId === "string" && uuidValidateV4(itemId)) await editItem({ id: itemId });
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
