import type { ComposableOptions } from "@/models/sound/ComposableOptions";
import type { PlayOptions } from "@/models/sound/PlayOptions";
import { dayjs } from "@/services/dayjs";
import { Howl } from "howler";

const cache = new Map<string, Howl>();

export const useSound = (
  url: MaybeRef<string>,
  { volume = 1, rate = 1, soundEnabled = true, interrupt, autoplay, onload, ...rest }: ComposableOptions = {},
) => {
  const sound = ref<Howl | null>(null);
  const duration = ref<number | null>(null);
  const isPlaying = ref<boolean>(false);

  function handleLoad(this: ComposableOptions) {
    if (typeof onload === "function") onload.call(this);
    duration.value = (duration.value ?? sound.value?.duration() ?? 0) * dayjs.duration(1, "second").asMilliseconds();
    if (autoplay) isPlaying.value = true;
  }

  watch(
    () => unref(url),
    ([src]) => {
      let howl = cache.get(src);
      if (howl) {
        sound.value = howl;
        return;
      }

      howl = new Howl({ src, volume: unref(volume), rate: unref(rate), onload: handleLoad, ...rest });
      sound.value = howl;
      cache.set(src, sound.value);
    },
    { immediate: true, flush: "post" },
  );

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

  const play = ({ id, rate, forceSoundEnabled }: PlayOptions = {}) => {
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
    sound,
    duration,
    isPlaying,
    play,
    pause,
    stop,
  };
};
