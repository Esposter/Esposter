import type { ComposableOptions } from "@/models/sound/ComposableOptions";
import type { PlayOptions } from "@/models/sound/PlayOptions";

import { Howl } from "howler";

const howlCache = new Map<string, Howl>();

export const useSound = (
  src: string,
  { autoplay, interrupt, onload, rate = 1, soundEnabled = true, volume = 1, ...rest }: ComposableOptions = {},
) => {
  const sound = ref<Howl>();
  const duration = ref<number>();
  const isPlaying = ref(false);
  // oxlint-disable-next-line func-style
  function handleLoad(this: ComposableOptions) {
    if (typeof onload === "function") onload.call(this);
    duration.value =
      (duration.value ?? sound.value?.duration() ?? 0) * Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
    if (autoplay) isPlaying.value = true;
  }

  onMounted(() => {
    let howl = howlCache.get(src);
    if (howl) {
      sound.value = howl;
      return;
    }

    howl = new Howl({ onload: handleLoad, rate: unref(rate), src, volume: unref(volume), ...rest });
    sound.value = howl;
    howlCache.set(src, sound.value);
  });

  watch(
    () => unref(volume),
    (newVolume) => {
      if (!sound.value) return;
      sound.value.volume(newVolume);
    },
  );

  watch(
    () => unref(rate),
    (newRate) => {
      if (!sound.value) return;
      sound.value.rate(newRate);
    },
  );

  const play = ({ forceSoundEnabled, id, rate: playRate }: PlayOptions = {}) => {
    if (!sound.value || !(soundEnabled || forceSoundEnabled)) return;
    if (interrupt) sound.value.stop();
    if (playRate) sound.value.rate(playRate);

    sound.value.play(id);
    sound.value.once("end", () => {
      if (sound.value && !sound.value.playing()) isPlaying.value = false;
    });
    isPlaying.value = true;
  };

  const stop = (id?: number) => {
    if (!sound.value) return;
    sound.value.stop(id);
    isPlaying.value = false;
  };

  const pause = (id?: number) => {
    if (!sound.value) return;
    sound.value.pause(id);
    isPlaying.value = false;
  };

  return {
    duration,
    isPlaying,
    pause,
    play,
    sound,
    stop,
  };
};
