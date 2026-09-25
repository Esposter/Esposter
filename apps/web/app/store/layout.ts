import { COMPOSER_ATTRIBUTE } from "@/services/app/constants";

export const useLayoutStore = defineStore("layout", () => {
  const { isMobile } = useUiDisplay();
  const isDesktop = computed(() => !isMobile.value);
  const isLeftDrawerOpen = ref(isDesktop.value);
  const isRightDrawerOpen = ref(isDesktop.value);
  // Resize-only refs, read-only to outer components: whether to show the drawer-toggle buttons
  // Depends solely on screen size, so the UI doesn't shift when a drawer opens or closes.
  const isLeftDrawerOpenAuto = ref(isDesktop.value);
  const isRightDrawerOpenAuto = ref(isDesktop.value);
  // While a composer has focus the narrow screen's dock steps aside for the keyboard. Read off where focus is rather
  // Than written by the composer, so a composer that unmounts with focus leaves nothing behind to reset
  const activeElement = useActiveElement();
  const isComposerFocused = computed(() => Boolean(activeElement.value?.closest(`[${COMPOSER_ATTRIBUTE}]`)));
  return {
    isComposerFocused,
    isDesktop,
    isLeftDrawerOpen,
    isLeftDrawerOpenAuto,
    isRightDrawerOpen,
    isRightDrawerOpenAuto,
  };
});
