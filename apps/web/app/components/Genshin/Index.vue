<script setup lang="ts">
import { GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL } from "#shared/services/genshin/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, and once its door is opened the world loading under the startup loading
// Screen, whose marks follow it, shown once that screen's white gives way. The world is mounted only at the door, and
// Draws no frames while the opening covers it, though its first view's ground still streams in. Its code arriving and
// That ground and the regions in reach of it having arrived are the two steps loading can see, since neither reports
// Any finer progress
const isLoaded = ref(false);
const isReady = ref(false);
const progress = computed(() => (Number(isLoaded.value) + Number(isReady.value)) / 2);
const isOpeningShown = ref(true);
const isDoorOpened = ref(false);
const gameText = await useGameText();
// The player's save, which the world starts from once it is loaded, and the lease the page holds for it
const { initialSave, isReplaced, onWorldGrant, onWorldSave, serverClockOffsetMs, takeBack } = await useGenshinSave();
// The world's loading is reported up, so a page that mounts the game, the agent console, can show its steps
const emit = defineEmits<{ load: []; ready: [] }>();
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld
        v-if="isDoorOpened"
        :game-text="gameText.text"
        :is-paused="isOpeningShown || isReplaced || undefined"
        :language="gameText.language"
        :save="initialSave"
        :server-clock-offset-ms
        @grant="onWorldGrant()"
        @load="
          isLoaded = true;
          emit('load');
        "
        @ready="
          isReady = true;
          emit('ready');
        "
        @save="(save) => onWorldSave(save)"
      />
    </ClientOnly>
    <!-- The replacing session holds the save now, so this page stops saving and pauses the world, and a take back starts the lease again -->
    <UiDialog
      :model-value="isReplaced"
      :placement="UiDialogPlacement.Middle"
      title="Logged in elsewhere"
      w="[min(32rem,90vw)]"
    >
      <div p-3 flex flex-col gap-3>
        <p>This game was started in another session, which now holds your save.</p>
        <footer flex justify-end>
          <UiButton :variant="UiButtonVariant.Accent" @click="takeBack()">Take back</UiButton>
        </footer>
      </div>
    </UiDialog>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        :game-text="gameText.text"
        :language="gameText.language"
        :music-recording-base-url="GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL"
        :progress
        @begin="isDoorOpened = true"
        @finish="isOpeningShown = false"
      />
      <!-- A progressbar is no live region, so its reaching the end is announced by nothing of its own. The world being
        Ready is said here to a screen reader alone, and only then, since the splashes and login load nothing -->
      <p role="status" sr-only>{{ isReady ? gameText.text[GameTextKey.Ready] : "" }}</p>
    </div>
  </div>
</template>
