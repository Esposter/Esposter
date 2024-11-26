import type { ComposableOptions } from "@/models/sound/ComposableOptions";
import type { PlayOptions } from "@/models/sound/PlayOptions";

import { dayjs } from "@/shared/services/dayjs";
import { Howl } from "howler";

const cache = new Map<string, Howl>();

export const useSound = (
  src: string,
  { autoplay, interrupt, onload, rate = 1, soundEnabled = true, volume = 1, ...rest }: ComposableOptions = {},
) => {
  const sound = ref<Howl>();
  const duration = ref<number>();
  const isPlaying = ref<boolean>(false);

  function handleLoad(this: ComposableOptions) {
    if (typeof onload === "function") onload.call(this);
    duration.value = (duration.value ?? sound.value?.duration() ?? 0) * dayjs.duration(1, "second").asMilliseconds();
    if (autoplay) isPlaying.value = true;
  }

  onMounted(() => {
    let howl = cache.get(src);
    if (howl) {
      sound.value = howl;
      return;
    }

    howl = new Howl({ onload: handleLoad, rate: unref(rate), src, volume: unref(volume), ...rest });
    sound.value = howl;
    cache.set(src, sound.value);
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

  const play = ({ forceSoundEnabled, id, rate }: PlayOptions = {}) => {
    if (!sound.value || !(soundEnabled || forceSoundEnabled)) return;
    if (interrupt) sound.value.stop();
    if (rate) sound.value.rate(rate);

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
