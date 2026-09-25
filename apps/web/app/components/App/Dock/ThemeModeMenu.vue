<script setup lang="ts">
import { ThemeModeIconMeaningMap } from "@/services/ui/ThemeModeIconMeaningMap";
import { useThemeModeStore } from "@/store/ui/themeMode";

const themeModeStore = useThemeModeStore();
const { themeMode } = storeToRefs(themeModeStore);
const themeModeCommands = useThemeModeCommands();
</script>

<!-- Its mark is the mode in force, so the dock says which one is on before the menu is opened -->
<template>
  <AppDockCommandMenu :commands="themeModeCommands" label="Theme">
    <UiIcon :meaning="ThemeModeIconMeaningMap[themeMode]" />
  </AppDockCommandMenu>
</template>
