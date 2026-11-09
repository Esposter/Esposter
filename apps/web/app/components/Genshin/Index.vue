<script setup lang="ts">
import {
  GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL,
  GENSHIN_SCENE_EXPORT_BASE_URL,
  LOADING_STALL_WARNING_SECONDS,
} from "#shared/services/genshin/constants";
import { getGenshinGameDataBaseUrl } from "#shared/services/genshin/getGenshinGameDataBaseUrl";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { GameLanguageTagMap, GameTextKey } from "genshin-text";
import { computeLoadingProgress, GameOpening } from "genshin-world";

// The game as it plays: its opening at once, and once its door is opened the world loading under the startup loading
// Screen, whose marks follow it, shown once that screen's white gives way. The world's screen is mounted once the save
// And the character packs are held, so its code and its tables arrive while the splashes and the login play, and its
// Session is held back until the door, then draws no frames while the opening covers it, though its first view's ground
// Still streams in. Its code arriving,
// The player's save being loaded, and that ground and the regions in reach of it having arrived are the three steps
// Loading can see, since none reports any finer progress
const isLoaded = ref(false);
const isReady = ref(false);
const isOpeningShown = ref(true);
const isDoorOpened = ref(false);
// Whether every character pack the opening downloads is held, which the world waits on, since it draws each model from them
const isPacksHeld = ref(false);
// A diagnostic only: while the opening shows, each step still unfinished when the warning time is up is logged by name,
// So a stall says what it waits on. Started before the awaits below, so a save that stalls in them is timed too, and
// Started again at the door, so a step still unfinished then is timed from it. The character packs are named until they
// Are held, and the world's two steps once the world is mounted, which the save and the packs allow before the door
// Opens. Nothing is skipped or fallen back to, so the world's absence stays as it was. The save's flag is only returned
// Once those awaits settle, so until then the warning reads the save as not loaded
let isSaveLoadedRef: Ref<boolean> | undefined;
const { start: startStallWarning } = useTimeoutFn(
  () => {
    if (!isOpeningShown.value) return;
    const steps: [string, boolean][] = [["save", isSaveLoadedRef?.value ?? false]];
    if (!isPacksHeld.value) steps.push(["character packs", false]);
    else if (isSaveLoadedRef?.value) steps.push(["world chunk", isLoaded.value], ["world ready", isReady.value]);
    for (const [step, isStepDone] of steps)
      if (!isStepDone)
        console.warn(`The loading screen has waited ${LOADING_STALL_WARNING_SECONDS} seconds on ${step}`);
  },
  Temporal.Duration.from({ seconds: LOADING_STALL_WARNING_SECONDS }).total("milliseconds"),
);
watch(isDoorOpened, () => startStallWarning(), { once: true });
const gameText = await useGameText();
// The account the page reads, whose hosted game data the opening reads its title logo and its login screen from
const containerBaseUrl = useContainerBaseUrl();
// The player's save, which the world starts from once it is loaded, and the lease the page holds for it. A start that
// Fails is retried until it takes, the page waiting on its save meanwhile
const {
  initialSave,
  isReplaced,
  isSaveLoaded,
  isStartRetrying,
  onWorldGrant,
  onWorldSave,
  retryStart,
  serverClockOffsetMs,
  takeBack,
} = await useGenshinSave();
isSaveLoadedRef = isSaveLoaded;
// The opening's character pack download, whose bytes the bar takes its first share from while any are pending
// The opening's type is named, since its inferred instance reads back through the progress bound to it, which is a cycle
const opening = useTemplateRef<InstanceType<typeof GameOpening>>("opening");
const progress = computed(() =>
  computeLoadingProgress(
    (Number(isSaveLoaded.value) + Number(isLoaded.value) + Number(isReady.value)) / 3,
    opening.value?.loadedBytes ?? 0,
    opening.value?.pendingBytes ?? 0,
  ),
);
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
    <!-- The replacing session holds the save now, so this page stops saving and pauses the world, and a take back starts the lease again -->
    <UiDialog
      :model-value="isReplaced"
      :placement="UiDialogPlacement.Middle"
      title="Logged in elsewhere"
      w="[min(32rem,90vw)]"
    >
      <p>This game was started in another session, which now holds your save.</p>
      <template #footer>
        <UiButton :variant="UiButtonVariant.Accent" @click="takeBack()">Take back</UiButton>
      </template>
    </UiDialog>
    <!-- A start that could not take the lease is retried with backoff, and the page's retry asks for it at once -->
    <UiDialog
      :model-value="isStartRetrying"
      :placement="UiDialogPlacement.Middle"
      title="Save not loaded"
      w="[min(32rem,90vw)]"
    >
      <p>Your save could not be loaded. The game waits here and tries again.</p>
      <template #footer>
        <UiButton :variant="UiButtonVariant.Accent" @click="retryStart()">Retry</UiButton>
      </template>
    </UiDialog>
    <div v-if="isOpeningShown" :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
      <GameOpening
        ref="opening"
        :game-data-base-url="getGenshinGameDataBaseUrl(containerBaseUrl)"
        :game-text="gameText.text"
        :language="gameText.language"
        :music-recording-base-url="GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL"
        player-name=""
        :progress
        :scene-export-base-url="IS_DEVELOPMENT ? GENSHIN_SCENE_EXPORT_BASE_URL : ''"
        @begin="isDoorOpened = true"
        @finish="isOpeningShown = false"
        @held="isPacksHeld = true"
      />
      <!-- A progressbar is no live region, so its reaching the end is announced by nothing of its own. The world being
        Ready is said here to a screen reader alone, and only then, since the splashes and login load none of it -->
      <p role="status" sr-only>{{ isReady ? gameText.text[GameTextKey.Ready] : "" }}</p>
    </div>
  </div>
</template>
