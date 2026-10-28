import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import { getFrameScale } from "#src/services/getFrameScale";
import { getFrameWidth } from "#src/services/getFrameWidth";
import { computed, onMounted, onScopeDispose, shallowRef, toValue, watch } from "vue";

export const useCanvasFrame = ({
  css,
  fill,
  frame,
  pane,
  width,
}: {
  css: MaybeRefOrGetter<string>;
  fill?: MaybeRefOrGetter<boolean>;
  frame: Ref<HTMLIFrameElement | null | undefined>;
  pane: Ref<HTMLElement | null | undefined>;
  width: MaybeRefOrGetter<number>;
}): {
  frameBody: ComputedRef<HTMLElement | undefined>;
  frameStyle: ComputedRef<Record<string, string>>;
  loaded: Promise<void>;
} => {
  const { promise: loaded, resolve: resolveLoaded } = Promise.withResolvers<void>();
  const frameDocument = shallowRef<Document>();
  const frameStyleSheet = shallowRef<CSSStyleSheet>();
  const paneHeight = shallowRef(0);
  const paneWidth = shallowRef(0);
  const frameBody = computed(() => frameDocument.value?.body);
  const frameWidth = computed(() => getFrameWidth(toValue(width), toValue(fill ?? false), paneWidth.value));
  const frameScale = computed(() => getFrameScale(paneWidth.value, frameWidth.value));
  const frameStyle = computed(() => ({
    height: `${paneHeight.value / frameScale.value}px`,
    transform: `scale(${frameScale.value})`,
    transformOrigin: "0 0",
    width: `${frameWidth.value}px`,
  }));

  const updatePaneSize = (paneElement: HTMLElement): void => {
    paneWidth.value = paneElement.clientWidth;
    paneHeight.value = paneElement.clientHeight;
  };
  let resizeObserver: ResizeObserver | undefined;
  onMounted(() => {
    const paneElement = pane.value;
    if (!paneElement) return;
    updatePaneSize(paneElement);
    resizeObserver = new ResizeObserver(() => {
      updatePaneSize(paneElement);
    });
    resizeObserver.observe(paneElement);
  });
  onScopeDispose(() => resizeObserver?.disconnect());

  const handleLoad = (): void => {
    const contentWindow = frame.value?.contentWindow;
    const contentDocument = frame.value?.contentDocument;
    if (!contentWindow || !contentDocument) return;

    // A sheet adopted into a document must be constructed in that document's realm, which the window's own type omits
    const frameRealm = contentWindow as typeof globalThis & Window;
    const styleSheet = new frameRealm.CSSStyleSheet();
    contentDocument.adoptedStyleSheets = [styleSheet];
    frameStyleSheet.value = styleSheet;
    frameDocument.value = contentDocument;
    resolveLoaded();
  };
  // Attached synchronously, so the load that follows the frame's insertion is never missed
  watch(
    frame,
    (frameElement, previousFrameElement) => {
      previousFrameElement?.removeEventListener("load", handleLoad);
      frameElement?.addEventListener("load", handleLoad);
    },
    { flush: "sync", immediate: true },
  );
  onScopeDispose(() => frame.value?.removeEventListener("load", handleLoad));

  // The page's css is replaced at most once per animation frame, so a burst of style patches writes the sheet once
  let styleFrame = 0;
  watch([frameStyleSheet, () => toValue(css)], ([styleSheet, cssText]) => {
    cancelAnimationFrame(styleFrame);
    styleFrame = requestAnimationFrame(() => styleSheet?.replaceSync(cssText));
  });
  onScopeDispose(() => {
    cancelAnimationFrame(styleFrame);
  });

  return { frameBody, frameStyle, loaded };
};
