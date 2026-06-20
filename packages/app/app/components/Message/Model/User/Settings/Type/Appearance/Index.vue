<script setup lang="ts">
import { ThemeMode } from "@/models/vuetify/ThemeMode";
import { THEME_COOKIE_NAME } from "@/services/vuetify/constants";
import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";
import { animateThemeTransition } from "@/util/vuetify/animateThemeTransition";

const theme = useVTheme();
const themeCookie = useCookie(THEME_COOKIE_NAME, { default: () => ThemeMode.system });
const radioGroup = useTemplateRef("radioGroup");
const changeTheme = (themeMode: ThemeMode) =>
  animateThemeTransition(radioGroup.value?.$el ?? null, () => {
    themeCookie.value = themeMode;
    theme.change(themeMode);
  });
</script>

<template>
  <v-container fluid>
    <div font-bold mb-4 text-title-medium>Appearance</div>
    <v-radio-group
      ref="radioGroup"
      :model-value="themeCookie"
      hide-details
      @update:model-value="changeTheme($event as ThemeMode)"
    >
      <v-radio v-for="mode of Object.values(ThemeMode)" :key="mode" :value="mode">
        <template #label>
          <v-icon :icon="ThemeModeIconMap[mode]" mr-2 />
          {{ ThemeModeTooltipMap[mode] }}
        </template>
      </v-radio>
    </v-radio-group>
  </v-container>
</template>
