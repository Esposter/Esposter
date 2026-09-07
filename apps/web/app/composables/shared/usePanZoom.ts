import type { PanzoomObject, PanzoomOptions } from "@panzoom/panzoom";

import Panzoom from "@panzoom/panzoom";

// One pan/zoom instance for whichever element the target currently holds. The element arrives after the content
// It wraps has rendered — a diagram written into a container, a dialog mounted on open — so the instance is
// Built from the target rather than on mount, and the scale is mirrored into a ref because panzoom keeps its own
// State outside vue's reactivity
export const usePanZoom = (
  target: MaybeRefOrGetter<HTMLElement | null | SVGElement | undefined>,
  options: PanzoomOptions,
) => {
  const panzoom = shallowRef<PanzoomObject>();
  const scale = ref(1);
  const isZoomed = computed(() => scale.value > 1);
  watch(
    () => toValue(target),
    (element) => {
      panzoom.value?.destroy();
      panzoom.value = element ? Panzoom(element, options) : undefined;
      scale.value = panzoom.value?.getScale() ?? 1;
    },
  );
  useEventListener(target, "panzoomchange", () => {
    scale.value = panzoom.value?.getScale() ?? 1;
  });

  onScopeDispose(() => {
    panzoom.value?.destroy();
  });
  return { isZoomed, panzoom };
};
