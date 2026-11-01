import type { Ref } from "vue";

import { MAP_DRAG_THRESHOLD_PIXELS } from "#src/services/map/constants";
import { computeWheelZoomMetres } from "#src/services/map/computeWheelZoomMetres";
import { unprojectMapPoint } from "#src/services/map/unprojectMapPoint";
import { ref } from "vue";

// The map's pan and its wheel zoom: a press that travels past the drag threshold pans the view by the drag, and the
// Pointer is captured only then, since a captured press's click lands on the map rather than on the landmark it was made on
export const useMapPan = (map: Readonly<Ref<SVGSVGElement | null>>, metres: Ref<number>) => {
  // The offset the map is dragged to from the player, in catalogue metres
  const pan = ref({ x: 0, z: 0 });
  // A press's start and last place, and whether it has travelled far enough to pan. These are not drawn, so they are
  // Plain variables rather than state
  let pressStart = { x: 0, y: 0 };
  let pointer = { x: 0, y: 0 };
  let isPanning = false;
  let isDragged = false;
  const onMapPointerDown = (event: PointerEvent) => {
    isPanning = true;
    isDragged = false;
    pressStart = { x: event.clientX, y: event.clientY };
    pointer = pressStart;
  };
  const onMapPointerMove = (event: PointerEvent) => {
    if (!isPanning || !map.value) return;
    if (
      !isDragged &&
      Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > MAP_DRAG_THRESHOLD_PIXELS
    ) {
      isDragged = true;
      map.value.setPointerCapture(event.pointerId);
    }
    const { height, width } = map.value.getBoundingClientRect();
    // The map is drawn over the screen's larger side, so a pixel is that many metres of the drawn width
    const metresPerPixel = metres.value / Math.max(width, height);
    // The view moves opposite to the pointer on the screen, so the drag's place is read back into the catalogue from the centre
    const drag = unprojectMapPoint(
      { x: -(event.clientX - pointer.x) * metresPerPixel, y: -(event.clientY - pointer.y) * metresPerPixel },
      { x: 0, z: 0 },
    );
    pan.value = { x: pan.value.x + drag.x, z: pan.value.z + drag.z };
    pointer = { x: event.clientX, y: event.clientY };
  };
  const onMapPointerUp = () => {
    isPanning = false;
  };
  // A drag that ends on a landmark is not a choice of it, so the click that follows it is stopped before the landmark
  const onMapClickCapture = (event: MouseEvent) => {
    if (!isDragged) return;
    event.stopPropagation();
    isDragged = false;
  };
  const onMapWheel = (event: WheelEvent) => {
    metres.value = computeWheelZoomMetres(metres.value, event.deltaY);
  };
  return { onMapClickCapture, onMapPointerDown, onMapPointerMove, onMapPointerUp, onMapWheel, pan };
};
