import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { noop } from "@esposter/shared";

// Animations off changes how long a presentation takes, never where it ends. Each one passes its end state here,
// So no call site checks the setting itself
export const animateOrSkip = (animate: () => Promise<void>, skip: () => void = noop) => {
  const settingsStore = useSettingsStore();
  if (!settingsStore.isSkipAnimations) return animate();

  skip();
  return Promise.resolve();
};
