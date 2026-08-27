import { MAX_ZOOM_SCALE, ZOOM_SCALE_PER_WHEEL_STEP } from "@/services/message/file/constants";

// Scale and offset for one zoomable element, as the transform to bind and the handlers that drive it. Panning is
// Only reachable past the first zoom step, because at the fitted size there is nothing outside the frame to reach
export const useZoomPan = () => {
  const scale = ref(1);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const panOrigin = ref<undefined | { x: number; y: number }>();
  const reset = () => {
    scale.value = 1;
    offsetX.value = 0;
    offsetY.value = 0;
    panOrigin.value = undefined;
  };
  const zoom = (event: WheelEvent) => {
    const nextScale = scale.value - Math.sign(event.deltaY) * ZOOM_SCALE_PER_WHEEL_STEP;
    scale.value = Math.min(Math.max(nextScale, 1), MAX_ZOOM_SCALE);
    // Zooming back out to the fitted size leaves no room to pan into, so the offset it was dragged to would
    // Otherwise strand the image off-centre with no way to bring it back
    if (scale.value === 1) {
      offsetX.value = 0;
      offsetY.value = 0;
    }
  };
  const startPan = (event: PointerEvent) => {
    if (scale.value === 1) return;
    panOrigin.value = { x: event.clientX - offsetX.value, y: event.clientY - offsetY.value };
  };
  const pan = (event: PointerEvent) => {
    const origin = panOrigin.value;
    if (!origin) return;
    offsetX.value = event.clientX - origin.x;
    offsetY.value = event.clientY - origin.y;
  };
  const endPan = () => {
    panOrigin.value = undefined;
  };
  const transform = computed(() => `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`);
  const isZoomed = computed(() => scale.value > 1);
  return { endPan, isZoomed, pan, reset, startPan, transform, zoom };
};
