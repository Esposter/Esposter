import type { GridCell } from "#src/models/GridCell";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridGesture } from "#src/models/GridGesture";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridLayoutOptions } from "#src/models/GridLayoutOptions";
import type { GridTile } from "#src/models/GridTile";
import type { MaybeRefOrGetter, ShallowRef } from "vue";

import { checkIsSameCell } from "#src/placement/checkIsSameCell";
import { fitLayout } from "#src/placement/fitLayout";
import { getCellPosition } from "#src/placement/getCellPosition";
import { getCellSize } from "#src/placement/getCellSize";
import { getColumnPitch } from "#src/placement/getColumnPitch";
import { getGestureCell } from "#src/placement/getGestureCell";
import { getLayoutBottom } from "#src/placement/getLayoutBottom";
import { placeMove } from "#src/placement/placeMove";
import { checkIsNestedControl } from "@esposter/shared";
import { computed, onMounted, onUnmounted, ref, shallowRef, toValue, watch } from "vue";

// The gesture state of a grid. A press on an item becomes a drag past the start distance, the drag previews the layout as
// The pointer moves, and the release writes the cells the drag changed, once. The consumer draws the returned tiles, binds
// Each item's press to startGesture and each handle's press to startResize, and the grid's element is the root the pointer is followed across
export const useGridLayout = <T extends GridItem>(
  root: Readonly<ShallowRef<HTMLElement | null>>,
  options: MaybeRefOrGetter<GridLayoutOptions<T>>,
): GridLayout<T> => {
  const getOptions = () => toValue(options);
  const width = ref(0);
  const gesture = shallowRef<GridGesture<T>>();
  // The cells as the gesture would leave them, held here until its release so the consumer is written once
  const preview = shallowRef<T[]>();
  const columnPitch = computed(() => getColumnPitch(width.value, getOptions().columnNumber, getOptions().spacing));
  const rowPitch = computed(() => getOptions().rowHeight + getOptions().spacing.gap);
  // Each item at its saved cell, kept within the columns and compacted, so a narrower screen never overlaps
  const layout = computed(() => fitLayout(getOptions().items, getOptions().columnNumber));
  const savedItemMap = computed(() => new Map(getOptions().items.map((item): [string, T] => [item.id, item])));
  const previewItemMap = computed(() => new Map((preview.value ?? []).map((item): [string, T] => [item.id, item])));
  const draggedGesture = computed(() =>
    gesture.value?.isStarted && !gesture.value.isResize ? gesture.value : undefined,
  );
  const getGeometry = (cell: GridCell): GridGeometry => {
    const { gap, padding } = getOptions().spacing;
    return {
      height: getCellSize(cell.h, rowPitch.value, gap),
      left: getCellPosition(cell.x, columnPitch.value, padding),
      top: getCellPosition(cell.y, rowPitch.value, padding),
      width: getCellSize(cell.w, columnPitch.value, gap),
    };
  };
  // A dragged item stays under the pointer while the others move aside, so it is drawn from its own cell and offset
  // The grid draws its tiles once it knows its width, as react-grid-layout's measureBeforeMount does, so neither a
  // Server render nor a first frame draws tiles of no width
  const tiles = computed((): GridTile<T>[] => {
    if (width.value === 0) return [];

    return layout.value.map((item) => {
      const dragged = draggedGesture.value?.origin.id === item.id ? draggedGesture.value : undefined;
      const cell = dragged ? item : (previewItemMap.value.get(item.id) ?? item);
      return {
        geometry: getGeometry(cell),
        isDragged: dragged !== undefined,
        item,
        offset: dragged?.offset ?? { x: 0, y: 0 },
      };
    });
  });
  const placeholder = computed((): GridGeometry | undefined => {
    if (!gesture.value?.isStarted) return undefined;

    const target = previewItemMap.value.get(gesture.value.origin.id);
    return target ? getGeometry(target) : undefined;
  });
  // The last row ends a gap short of the next row's top, so the grid's bottom padding follows that row and not the gap
  const gridHeight = computed(() => {
    const { gap, padding } = getOptions().spacing;
    const layoutBottom = getLayoutBottom(preview.value ?? layout.value);
    return Math.max(0, getCellSize(layoutBottom, rowPitch.value, gap)) + 2 * padding;
  });
  const resetGesture = () => {
    gesture.value = undefined;
    preview.value = undefined;
  };
  // A gesture previews the layout it began on, so a layout replaced under it — a reload, a restore, another column
  // Count — ends the gesture rather than letting its release write cells the new layout never had
  watch(layout, () => {
    resetGesture();
  });

  // A press starts a gesture, which becomes a drag only past the start distance, so a press that barely moves stays a click
  const beginGesture = (event: PointerEvent, item: T, isResize: boolean) => {
    // Only the primary button starts a gesture, since a touch or pen contact reports button 0 too
    if (event.button !== 0) return;
    if (!getOptions().isEditable || checkIsNestedControl(event)) return;
    // A held gesture belongs to the pointer that began it, so another pointer's press waits for its release
    if (gesture.value && gesture.value.pointerId !== event.pointerId) return;
    if (!(event.currentTarget instanceof Element)) return;

    gesture.value = {
      element: event.currentTarget,
      isResize,
      isStarted: false,
      offset: { x: 0, y: 0 },
      origin: item,
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
    };
  };
  const startGesture = (event: PointerEvent, item: T) => {
    beginGesture(event, item, false);
  };
  // A press on the resize handle pulls the item's south-east corner, and keeps its origin where it is
  const startResize = (event: PointerEvent, item: T) => {
    beginGesture(event, item, true);
  };
  const handlePointerMove = (event: PointerEvent) => {
    const activeGesture = gesture.value;
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;
    // A press released outside this grid never reaches its release, so a move with no button held ends the gesture
    if (!activeGesture.isStarted && event.buttons === 0) {
      resetGesture();
      return;
    }

    const offset = { x: event.clientX - activeGesture.start.x, y: event.clientY - activeGesture.start.y };
    if (!activeGesture.isStarted && Math.hypot(offset.x, offset.y) < getOptions().dragStartDistance) return;

    // The drag holds the pointer, so nothing else it passes over takes a hover or its events, and a press that stays a click never does
    if (!activeGesture.isStarted) activeGesture.element.setPointerCapture(event.pointerId);
    const cell = getGestureCell({
      columnNumber: getOptions().columnNumber,
      columnPitch: columnPitch.value,
      isResize: activeGesture.isResize,
      offset,
      origin: activeGesture.origin,
      rowPitch: rowPitch.value,
    });
    const isCellChanged = !activeGesture.cell || !checkIsSameCell(cell, activeGesture.cell);
    gesture.value = { ...activeGesture, cell, isStarted: true, offset };
    if (isCellChanged) preview.value = placeMove(layout.value, cell);
  };
  // The cells of a layout that differ from the saved one, or are new to it, in the form the consumer writes back
  const getChangedCells = (changedLayout: GridItem[]): GridItem[] =>
    changedLayout.flatMap((item): GridItem[] => {
      const savedItem = savedItemMap.value.get(item.id);
      return !savedItem || !checkIsSameCell(item, savedItem)
        ? [{ h: item.h, id: item.id, w: item.w, x: item.x, y: item.y }]
        : [];
    });
  // A release writes what the drag previewed, once, and a release that changed no cell writes nothing
  const handlePointerUp = (event: PointerEvent) => {
    const activeGesture = gesture.value;
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;

    const changes = getChangedCells(preview.value ?? []);
    resetGesture();
    if (changes.length > 0) getOptions().onCommit(changes);
  };
  const handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId === gesture.value?.pointerId) resetGesture();
  };

  // The observer and the listeners' controller are held from mount, so unmount detaches what mount attached
  const attached = shallowRef<{ controller: AbortController; observer: ResizeObserver }>();
  onMounted(() => {
    const element = root.value;
    if (!element) return;

    const controller = new AbortController();
    const { signal } = controller;
    const observer = new ResizeObserver(([entry]) => {
      width.value = entry?.contentRect.width ?? 0;
    });
    observer.observe(element);
    element.addEventListener("pointermove", handlePointerMove, { signal });
    element.addEventListener("pointerup", handlePointerUp, { signal });
    element.addEventListener("pointercancel", handlePointerCancel, { signal });
    attached.value = { controller, observer };
  });
  onUnmounted(() => {
    if (!attached.value) return;

    const { controller, observer } = attached.value;
    observer.disconnect();
    controller.abort();
  });

  return { gridHeight, placeholder, startGesture, startResize, tiles };
};
