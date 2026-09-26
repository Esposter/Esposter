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
  // A touch screen types on a keyboard drawn over the page, which a narrow window on a desktop never does: the input
  // Question, never the width one (`responsive` docs page, "Viewport is not device")
  const isTouchScreen = useMediaQuery("(pointer: coarse)");
  // While a composer has focus on a touch screen the dock steps aside for the keyboard drawn over it. Read off where
  // Focus is rather than written by the composer, so a composer that unmounts with focus leaves nothing behind to reset
  const activeElement = useActiveElement();
  const isDockSteppedAside = computed(
    () => isTouchScreen.value && Boolean(activeElement.value?.closest(`[${COMPOSER_ATTRIBUTE}]`)),
  );
  return {
    isDesktop,
    isDockSteppedAside,
    isLeftDrawerOpen,
    isLeftDrawerOpenAuto,
    isRightDrawerOpen,
    isRightDrawerOpenAuto,
    isTouchScreen,
  };
});
