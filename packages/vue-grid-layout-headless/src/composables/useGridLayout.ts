import type { GridCell } from "#src/models/GridCell";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridGesture } from "#src/models/GridGesture";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridLayoutOptions } from "#src/models/GridLayoutOptions";
import type { GridPoint } from "#src/models/GridPoint";
import type { GridTile } from "#src/models/GridTile";
import type { MountedGrid } from "#src/models/MountedGrid";
import type { ResizeEdge } from "#src/models/ResizeEdge";
import type { MaybeRefOrGetter, ShallowRef } from "vue";

import { CollisionMode } from "#src/models/CollisionMode";
import { checkIsColliding } from "#src/placement/checkIsColliding";
import { checkIsSameCell } from "#src/placement/checkIsSameCell";
import { compactLayout } from "#src/placement/compactLayout";
import { correctBounds } from "#src/placement/correctBounds";
import { fitLayout } from "#src/placement/fitLayout";
import { getCellPosition } from "#src/placement/getCellPosition";
import { getCellSize } from "#src/placement/getCellSize";
import { getCellSpan } from "#src/placement/getCellSpan";
import { getColumnPitch } from "#src/placement/getColumnPitch";
import { getGestureCell } from "#src/placement/getGestureCell";
import { getLayoutBottom } from "#src/placement/getLayoutBottom";
import { placeMove } from "#src/placement/placeMove";
import { findGridAt } from "#src/services/findGridAt";
import { findGridRoot } from "#src/services/findGridRoot";
import { mountedGrids } from "#src/services/mountedGrids";
import { checkIsNestedControl, takeOne } from "@esposter/shared";
import { computed, onMounted, onUnmounted, ref, shallowRef, toValue } from "vue";

// The gesture state of a grid. A press on an item becomes a drag past the start distance, the drag previews the layout as
// The pointer moves, and the release writes the cells the drag changed, once. The consumer draws the returned tiles and
// Binds each item's press to startGesture, and the grid's element is the root the pointer is followed across
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
  const layout = computed(() => fitLayout(getOptions().items, getOptions().columnNumber, getOptions().compactType));
  const savedItemMap = computed(() => new Map(getOptions().items.map((item): [string, T] => [item.id, item])));
  const previewItemMap = computed(() => new Map((preview.value ?? []).map((item): [string, T] => [item.id, item])));
  const draggedGesture = computed(() => (gesture.value?.isStarted && !gesture.value.edge ? gesture.value : undefined));
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
  const tiles = computed((): GridTile<T>[] =>
    layout.value.map((item) => {
      const dragged = draggedGesture.value?.origin.id === item.id ? draggedGesture.value : undefined;
      const cell = dragged ? item : (previewItemMap.value.get(item.id) ?? item);
      return {
        geometry: getGeometry(cell),
        isDragged: dragged !== undefined,
        item,
        offset: dragged?.offset ?? { x: 0, y: 0 },
      };
    }),
  );
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

  // A press starts a gesture, which becomes a drag only past the start distance, so a press that barely moves stays a click
  const startGesture = (event: PointerEvent, item: T, edge?: ResizeEdge) => {
    // Only the primary button starts a gesture, since a touch or pen contact reports button 0 too
    if (event.button !== 0) return;
    if (!getOptions().isEditable || checkIsNestedControl(event)) return;
    // A held gesture belongs to the pointer that began it, so another pointer's press waits for its release
    if (gesture.value && gesture.value.pointerId !== event.pointerId) return;
    if (!(event.currentTarget instanceof Element) || !(event.target instanceof Element)) return;
    // A press on a nested grid's item belongs to that grid, so the grid around it takes no gesture from it
    if (findGridRoot(event.target) !== root.value) return;

    gesture.value = {
      edge,
      element: event.currentTarget,
      isStarted: false,
      offset: { x: 0, y: 0 },
      origin: item,
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
    };
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
      edge: activeGesture.edge,
      offset,
      origin: activeGesture.origin,
      rowPitch: rowPitch.value,
    });
    const isCellChanged = !activeGesture.cell || !checkIsSameCell(cell, activeGesture.cell);
    gesture.value = { ...activeGesture, cell, isStarted: true, offset };
    if (isCellChanged) preview.value = placeMove(layout.value, cell, getOptions());
  };
  // The cells of a layout that differ from the saved one, or are new to it, in the form the consumer writes back
  const getChangedCells = (changedLayout: GridItem[]): GridItem[] =>
    changedLayout.flatMap((item): GridItem[] => {
      const savedItem = savedItemMap.value.get(item.id);
      return !savedItem || !checkIsSameCell(item, savedItem)
        ? [{ h: item.h, id: item.id, w: item.w, x: item.x, y: item.y }]
        : [];
    });
  // A dropped item lands with its top-left under the point, within the columns, and compacts and resolves its collisions as
  // A move here does. Under prevent a drop that lands on another item is refused, so nothing is committed and it returns false
  const accept = (item: Pick<GridItem, "h" | "id" | "w">, point: GridPoint): boolean => {
    const element = root.value;
    if (!element || !getOptions().isEditable) return false;

    const { left, top } = element.getBoundingClientRect();
    const { padding } = getOptions().spacing;
    const offset = { x: point.x - left - padding, y: point.y - top - padding };
    const columnIndex = Math.floor(offset.x / columnPitch.value);
    const rowIndex = Math.floor(offset.y / rowPitch.value);
    const x = Math.min(Math.max(columnIndex, 0), getOptions().columnNumber - item.w);
    const y = Math.max(0, rowIndex);
    const cell = takeOne(correctBounds([{ h: item.h, id: item.id, w: item.w, x, y }], getOptions().columnNumber));
    const isRefused =
      getOptions().collision === CollisionMode.Prevent && layout.value.some((other) => checkIsColliding(cell, other));
    if (isRefused) return false;

    const landedLayout = placeMove([...layout.value, cell], cell, getOptions());
    const changes = getChangedCells(landedLayout);
    getOptions().onCommit({ changes, removed: [] });
    return true;
  };
  const self: MountedGrid = { accept };
  // A release over this grid writes what the drag previewed. A drag released over another grid leaves this one and lands there,
  // And a drag released over no grid is dropped, so the item stays where it was
  const handlePointerUp = (event: PointerEvent) => {
    const activeGesture = gesture.value;
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;

    const point = { x: event.clientX, y: event.clientY };
    const dropGrid = draggedGesture.value ? findGridAt(point, activeGesture.element) : self;
    const changes = getChangedCells(preview.value ?? []);
    resetGesture();
    if (dropGrid === self) {
      if (changes.length > 0) getOptions().onCommit({ changes, removed: [] });
      return;
    }
    if (!dropGrid) return;
    // The source lets go of the item only once the grid under the pointer has taken it, so a refused drop stays in its source
    if (!dropGrid.accept(activeGesture.origin, point)) return;

    const remainingItems = layout.value.filter((item) => item.id !== activeGesture.origin.id);
    const remainingLayout = compactLayout(remainingItems, getOptions().columnNumber, getOptions().compactType);
    getOptions().onCommit({ changes: getChangedCells(remainingLayout), removed: [activeGesture.origin.id] });
  };
  // An auto-height item takes the whole rows that hold its reported content, and the layout compacts around it, as one commit
  const reportContentHeight = (id: string, contentHeight: number) => {
    const savedItem = savedItemMap.value.get(id);
    if (!savedItem?.isAutoHeight) return;

    const h = getCellSpan(contentHeight, rowPitch.value, getOptions().spacing.gap);
    if (h === savedItem.h) return;

    const otherItems = getOptions().items.filter((item) => item.id !== id);
    const changes = getChangedCells(
      fitLayout([...otherItems, { ...savedItem, h }], getOptions().columnNumber, getOptions().compactType),
    );
    if (changes.length > 0) getOptions().onCommit({ changes, removed: [] });
  };
  const handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId === gesture.value?.pointerId) resetGesture();
  };

  // The element and its observer are held from mount, so unmount detaches exactly what mount attached
  const attached = shallowRef<{ element: HTMLElement; observer: ResizeObserver }>();
  onMounted(() => {
    const element = root.value;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      width.value = entry?.contentRect.width ?? 0;
    });
    observer.observe(element);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerCancel);
    mountedGrids.set(element, self);
    attached.value = { element, observer };
  });
  onUnmounted(() => {
    if (!attached.value) return;

    const { element, observer } = attached.value;
    observer.disconnect();
    mountedGrids.delete(element);
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerup", handlePointerUp);
    element.removeEventListener("pointercancel", handlePointerCancel);
  });

  return { gridHeight, placeholder, reportContentHeight, startGesture, tiles };
};
