<script setup lang="ts">
import type { GameLanguage, GameText } from "genshin-text";
import type { DevRegistry } from "genshin-world";
import type { GenshinSave } from "genshin-world/save";

import { GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GENSHIN_DEV_COMMAND_GROUP, GENSHIN_DEV_STATS_GROUP } from "@/services/genshin/dev/constants";
import { createBooleanVariable, createDevRegistry, createStatCommand, exposeDevRegistry } from "genshin-world";

interface Props {
  // Hands a changed save back to the page, which applies it by a reload
  applySave: (save: GenshinSave) => void;
  gameDataBaseUrl: string;
  gameText: GameText;
  // The save the world last wrote, which the developer's save commands read
  getSave: () => GenshinSave;
  language: GameLanguage;
}

// The developer surface, loaded only in a development build: it makes the developer registry and hands it up before the
// World mounts, since the world's parts take the registry as they set up. It registers the save commands, the stats switch
// and the shortcuts, and draws the console, the panel and the stats overlay. A browser driven by automation takes the
// registry through `window.__dev` and mounts no surface, since a panel would cover the scene it shoots
const { applySave, gameDataBaseUrl, gameText, getSave, language } = defineProps<Props>();
const emit = defineEmits<{ registry: [registry: DevRegistry] }>();
const devRegistry = createDevRegistry();
emit("registry", devRegistry);

const isDevSurfaceShown = ref(false);
const isDevConsoleOpen = ref(false);
const isDevPanelOpen = ref(false);
const isStatShown = ref(false);
// The stats overlay's switch, which the console's `stat` command and the panel's Stats tab both set
onScopeDispose(
  devRegistry.register({
    commands: [
      createStatCommand({
        setStatShown: (isShown) => {
          isStatShown.value = isShown;
        },
      }),
    ],
    variables: [
      createBooleanVariable({
        get: () => isStatShown.value,
        group: GENSHIN_DEV_STATS_GROUP,
        name: "stat",
        set: (isShown) => {
          isStatShown.value = isShown;
        },
      }),
    ],
  }),
);
useGenshinDevSaveCommands({
  applySave,
  devRegistry,
  gameDataBaseUrl,
  gameText,
  getSave,
  language,
  regionDataBaseUrl: GENSHIN_REGION_DATA_BASE_URL,
});
useCommands(() =>
  isDevSurfaceShown.value
    ? [
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "open-dev-console",
          meaning: UiIconMeaning.Command,
          run: () => {
            isDevConsoleOpen.value = true;
          },
          shortcut: "`",
          title: "Open the developer console",
        },
        {
          group: GENSHIN_DEV_COMMAND_GROUP,
          id: "toggle-dev-panel",
          meaning: UiIconMeaning.Settings,
          run: () => {
            isDevPanelOpen.value = !isDevPanelOpen.value;
          },
          shortcut: "f2",
          title: "Show or hide the developer panel",
        },
      ]
    : [],
);
onMounted(() => {
  if (window.navigator.webdriver) exposeDevRegistry(devRegistry, window);
  else isDevSurfaceShown.value = true;
});
</script>

<template>
  <template v-if="isDevSurfaceShown">
    <GenshinDevConsole v-model="isDevConsoleOpen" :registry="devRegistry" />
    <GenshinDevPanel v-model="isDevPanelOpen" :registry="devRegistry" />
    <GenshinDevStats v-if="isStatShown" :registry="devRegistry" />
  </template>
</template>
