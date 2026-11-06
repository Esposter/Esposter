import { createGlobeScene } from "@/services/visual/globe/createGlobeScene";
import { getNextQualityTier } from "@/services/visual/globe/getNextQualityTier";
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";
import { getResult, noop } from "@esposter/shared";

const { sampleCount, warmupFrames } = GlobeConfiguration;

// The globe is decoration on the About page, so a browser that cannot make a WebGL context shows the page without it
export const useGlobeScene = (canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>) => {
  const { width } = useElementSize(canvas);
  const reducedMotion = usePreferredReducedMotion();
  const isReducedMotion = computed(() => reducedMotion.value === "reduce");
  const isVisible = ref(false);
  let scene: ReturnType<typeof createGlobeScene> | undefined;
  let elapsed = 0;
  let frameCount = 0;
  let tier = 0;
  const frameDurations: number[] = [];

  const { pause, resume } = useRafFn(
    ({ delta }) => {
      if (!scene) return;
      elapsed += delta;
      scene.render(elapsed);
      if (frameCount++ < warmupFrames) return;
      frameDurations.push(delta);
      if (frameDurations.length > sampleCount) frameDurations.shift();
      const nextTier = getNextQualityTier(frameDurations, tier);
      if (nextTier === tier) return;
      tier = nextTier;
      frameDurations.length = 0;
      scene.setQualityTier(tier);
    },
    { immediate: false },
  );

  // A still globe draws only when something has changed: the reader dragged it, or the window resized it
  const renderStill = () => {
    if (isReducedMotion.value) scene?.draw(elapsed, true);
  };

  useIntersectionObserver(canvas, ([entry]) => {
    isVisible.value = entry?.isIntersecting ?? false;
  });

  watch([isVisible, isReducedMotion], ([newIsVisible, newIsReducedMotion]) => {
    if (!scene) return;
    // Damping needs a frame loop to finish its glide, so a still globe turns exactly as far as it is dragged
    scene.controls.enableDamping = !newIsReducedMotion;
    if (newIsVisible && !newIsReducedMotion) resume();
    else pause();
    renderStill();
  });

  watch(width, (newWidth) => {
    if (!scene || newWidth === 0) return;
    scene.setSize(newWidth);
    renderStill();
  });

  onMounted(() => {
    const element = canvas.value;
    if (!element) return;
    getResult(() => {
      scene = createGlobeScene(element, element.clientWidth);
      scene.controls.enableDamping = !isReducedMotion.value;
      scene.controls.addEventListener("change", renderStill);
      if (isVisible.value && !isReducedMotion.value) resume();
      renderStill();
    }).match(noop, console.error);
  });

  onScopeDispose(() => {
    pause();
    scene?.dispose();
    scene = undefined;
  });
};
