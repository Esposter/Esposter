<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const uiStyleCommands = useUiStyleCommands();
</script>

<template>
  <AppDockCommandMenu :commands="uiStyleCommands" label="Style">
    <UiIcon :meaning="UiIconMeaning.Style" />
  </AppDockCommandMenu>
</template>
