<script setup lang="ts">
import { GENSHIN_SCENE_EXPORT_BASE_URL, LOADING_STALL_WARNING_SECONDS } from "#shared/services/genshin/constants";
import { IS_NUXT_DEVELOPMENT } from "#shared/util/environment/constants";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { GameOpening } from "genshin-world";

// The game as it plays: its opening at once, and once its door is opened the world loading under the startup loading
// Screen, whose marks follow it, shown once that screen's white gives way. The world's screen is mounted once the save
// And the character packs are held, so its code and its tables arrive while the splashes and the login play, and its
// Session is held back until the door, then draws no frames while the opening covers it, though its first view's ground
// Still streams in. Its code arriving, the player's save being loaded, and that ground and the regions in reach of it
// Having arrived are the three steps Loading can see, since none reports any finer progress
const isLoaded = ref(false);
const isReady = ref(false);
const isOpeningShown = ref(true);
const isDoorOpened = ref(false);
// Whether every character pack the opening downloads is held, which the world waits on.
// It draws each model from them.
const isPacksHeld = ref(false);
// The stall warning's wait, and the warning each stall timer logs for a step still unfinished when the wait is up
const stallWarningMs = Temporal.Duration.from({ seconds: LOADING_STALL_WARNING_SECONDS }).total("milliseconds");
const warnStall = (step: string): void => {
  console.warn(`The loading screen has waited ${LOADING_STALL_WARNING_SECONDS} seconds on ${step}`);
};
// A diagnostic only: while the opening shows, each step still unfinished when the warning time is up is logged by name,
// So a stall says what it waits on. Started at the door, the request that releases the world's held session, so the
// Title's wait is never named and a step still unfinished then is timed from it. The save and the world's two steps are
// Named; the character packs have their own timer, started at their request. Nothing is skipped or fallen back to, so
// The world's absence stays as it was. The save's flag is only returned once those awaits settle, so until then the
// Warning reads the save as not loaded
let isSaveLoadedRef: Ref<boolean> | undefined;
const { start: startStallWarning } = useTimeoutFn(
  () => {
    if (!isOpeningShown.value) return;
    const steps: [string, boolean][] = [["save", isSaveLoadedRef?.value ?? false]];
    if (isPacksHeld.value && isSaveLoadedRef?.value)
      steps.push(["world chunk", isLoaded.value], ["world ready", isReady.value]);
    for (const [step, isStepDone] of steps) if (!isStepDone) warnStall(step);
  },
  stallWarningMs,
  { immediate: false },
);
watch(isDoorOpened, () => startStallWarning(), { once: true });
// The character packs are timed from the request the opening makes at the title's click, so a player still at the title
// Is never told that they stall
const { start: startPacksStallWarning } = useTimeoutFn(
  () => {
    if (isOpeningShown.value && !isPacksHeld.value) warnStall("character packs");
  },
  stallWarningMs,
  { immediate: false },
);
const gameText = await useGameText();
// The origin the page reads its hosted game data from: the opening reads its title logo and its login screen from it
const gameDataBaseUrl = useRuntimeConfig().public.hostedAssets.baseUrl;
// The player's save, which the world starts from once it is loaded, and the lease the page holds for it. A start that
// Fails is retried until it takes, the page waiting on its save meanwhile
const {
  initialSave,
  isReplaced,
  isSaveLoaded,
  isStartPending,
  isStartRetrying,
  onWorldGrant,
  onWorldSave,
  retryStart,
  serverClockOffsetMs,
  takeBack,
} = await useGenshinSave();
isSaveLoadedRef = isSaveLoaded;
// The elemental loading screen's bar is the world's own steps alone, a third each. The character packs' download is on
// The launch loading bar, which the opening shows, so the bar here never counts its bytes
const progress = computed(() => (Number(isSaveLoaded.value) + Number(isLoaded.value) + Number(isReady.value)) / 3);
</script>

<template>
  <div size-full relative of-hidden>
    <ClientOnly>
      <LazyGenshinWorld
        v-if="isSaveLoaded && isPacksHeld"
        :game-text="gameText.text"
        :is-held="!isDoorOpened"
        :is-paused="isOpeningShown || isReplaced"
        :language="gameText.language"
        :save="initialSave"
        :server-clock-offset-ms
        @grant="onWorldGrant()"
        @load="isLoaded = true"
        @ready="isReady = true"
        @save="(save) => onWorldSave(save)"
      />
    </ClientOnly>
    <!-- The replacing session holds the save now, so this page stops saving and pauses the world, and a take back
      starts the lease again -->
    <UiDialog
      :model-value="isReplaced"
      :placement="UiDialogPlacement.Middle"
      title="Logged in elsewhere"
      :size="UiDialogSize.Medium"
    >
      <p>This game was started in another session, which now holds your save.</p>
      <template #footer>
        <UiButton :is-pending="isStartPending" :variant="UiButtonVariant.Accent" @click="takeBack()"
        >Take back</UiButton>
      </template>
    </UiDialog>
    <!-- A start that could not take the lease is retried with backoff, and the page's retry asks for it at once -->
    <UiDialog
      :model-value="isStartRetrying"
      :placement="UiDialogPlacement.Middle"
      title="Save not loaded"
      :size="UiDialogSize.Medium"
    >
      <p>Your save could not be loaded. The game waits here and tries again.</p>
      <template #footer>
        <UiButton :is-pending="isStartPending" :variant="UiButtonVariant.Accent" @click="retryStart()">Retry</UiButton>
      </template>
    </UiDialog>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        :game-data-base-url
        :game-text="gameText.text"
        :language="gameText.language"
        player-name=""
        :progress
        :scene-export-base-url="IS_NUXT_DEVELOPMENT ? GENSHIN_SCENE_EXPORT_BASE_URL : ''"
        @begin="isDoorOpened = true"
        @download="startPacksStallWarning()"
        @finish="isOpeningShown = false"
        @held="isPacksHeld = true"
      />
      <!-- A progressbar is no live region, so its reaching the end is announced by nothing of its own. The world being
        Ready is said here to a screen reader alone, and only then, since the splashes and login load none of it -->
      <p role="status" sr-only>{{ isReady ? gameText.text[GameTextKey.Ready] : "" }}</p>
    </div>
  </div>
</template>
