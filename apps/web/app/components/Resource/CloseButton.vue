<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useNavigationTrailStore } from "@/store/navigationTrail";

const navigationTrailStore = useNavigationTrailStore();
const { closeTo } = storeToRefs(navigationTrailStore);
</script>

<!-- The ✕ every resource-area page closes by, peeling back to the page the visitor came through -->
<template>
  <UiTooltip #default="{ activatorProps }" label="Close">
    <UiButtonLink :="activatorProps" :to="closeTo" aria-label="Close" :variant="UiButtonVariant.Quiet" px-0>
      <UiIcon :meaning="UiIconMeaning.Close" />
    </UiButtonLink>
  </UiTooltip>
</template>
