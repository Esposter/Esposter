import { getOrCreate } from "@esposter/shared";
import { Howl } from "howler";

// One Howl per source for the app's lifetime: the same clip plays from every row of a list, and a Howl each
// Would decode the file again per caller
const howlMap = new Map<string, Howl>();

export const useSound = (src: string) => {
  const sound = ref<Howl>();

  onMounted(() => {
    sound.value = getOrCreate(howlMap, src, () => new Howl({ src }));
  });

  return {
    play: () => {
      sound.value?.play();
    },
  };
};
