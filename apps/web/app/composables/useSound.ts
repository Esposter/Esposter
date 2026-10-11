import { getOrCreate } from "@esposter/shared";

// One element per source for the app's lifetime: the same clip plays from every row of a list, and an element each
// Would fetch the file again per caller
const audioMap = new Map<string, HTMLAudioElement>();

export const useSound = (src: string) => {
  const sound = ref<HTMLAudioElement>();

  onMounted(() => {
    sound.value = getOrCreate(audioMap, src, () => new Audio(src));
  });

  return {
    play: async () => {
      // A clone per play, so a clip overlaps itself as each play of a Howl does, rather than cutting the last one off
      // `cloneNode` is typed as returning a bare Node, so the clone is narrowed back to the element it is
      const clone = sound.value?.cloneNode();
      if (clone instanceof HTMLAudioElement) await clone.play();
    },
  };
};
