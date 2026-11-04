import type { GridBlock } from "#src/models/GridBlock";
import type { GridCell } from "#src/models/GridCell";
import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridGesture } from "#src/models/GridGesture";
import type { GridItem } from "#src/models/GridItem";
import type { GridLayout } from "#src/models/GridLayout";
import type { GridLayoutOptions } from "#src/models/GridLayoutOptions";
import type { GridPlaceholder } from "#src/models/GridPlaceholder";
import type { GridPoint } from "#src/models/GridPoint";
import type { GridPreview } from "#src/models/GridPreview";
import type { GridStep } from "#src/models/GridStep";
import type { GridTile } from "#src/models/GridTile";
import type { MountedGrid } from "#src/models/MountedGrid";
import type { ResizeEdge } from "#src/models/ResizeEdge";
import type { MaybeRefOrGetter, ShallowRef } from "vue";

import { checkChangesHeight } from "#src/placement/checkChangesHeight";
import { checkIsSameCell } from "#src/placement/checkIsSameCell";
import { clampCell } from "#src/placement/clampCell";
import { fitLayout } from "#src/placement/fitLayout";
import { getCellPosition } from "#src/placement/getCellPosition";
import { getCellSize } from "#src/placement/getCellSize";
import { getCellSpan } from "#src/placement/getCellSpan";
import { getColumnPitch } from "#src/placement/getColumnPitch";
import { getGestureCell } from "#src/placement/getGestureCell";
import { getLayoutBottom } from "#src/placement/getLayoutBottom";
import { placeMove } from "#src/placement/placeMove";
import { GRID_MIN_SPAN } from "#src/services/constants";
import { mountedGrids } from "#src/services/mountedGrids";
import { checkIsNestedControl } from "@esposter/shared";
import { computed, onMounted, onUnmounted, ref, shallowRef, toValue, watch } from "vue";

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
  // The previews of a drag and of an external drop, held until the release or the clear. A drag's preview wins when both are set
  const gesturePreview = shallowRef<GridPreview>();
  const externalPreview = shallowRef<GridPreview>();
  const activePreview = computed(() => gesturePreview.value ?? externalPreview.value);
  const columnPitch = computed(() => getColumnPitch(width.value, getOptions().columnNumber, getOptions().spacing));
  const rowPitch = computed(() => getOptions().rowHeight + getOptions().spacing.gap);
  // Each item at its saved cell, kept within the columns and compacted, so a narrower screen never overlaps
  const layout = computed(() => fitLayout(getOptions().items, getOptions().columnNumber, getOptions().compactType));
  const savedItemMap = computed(() => new Map(getOptions().items.map((item): [string, T] => [item.id, item])));
  const previewItemMap = computed(
    () => new Map((activePreview.value?.layout ?? []).map((item): [string, GridItem] => [item.id, item])),
  );
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
  const placeholder = computed((): GridPlaceholder | undefined => {
    if (!activePreview.value) return undefined;

    const { cell, isRefused } = activePreview.value;
    return { geometry: getGeometry(cell), isRefused };
  });
  // The last row ends a gap short of the next row's top, so the grid's bottom padding follows that row and not the gap
  const gridHeight = computed(() => {
    const { gap, padding } = getOptions().spacing;
    const layoutBottom = getLayoutBottom(activePreview.value?.layout ?? layout.value);
    return Math.max(0, getCellSize(layoutBottom, rowPitch.value, gap)) + 2 * padding;
  });
  // Ending a gesture also ends the drop preview an external drag holds, since a layout replaced under either is no longer the one previewed
  const resetGesture = () => {
    gesture.value = undefined;
    gesturePreview.value = undefined;
    externalPreview.value = undefined;
  };
  // A gesture previews the layout it began on, so a layout replaced under it — a reload, a restore, another column
  // Count — ends the gesture rather than letting its release write cells the new layout never had. A held external
  // Preview was laid out on that layout too, and resetting the gesture drops it, so the next move previews the new one
  watch(layout, () => {
    resetGesture();
  });
  // The layout a cell lands in, as the collision mode resolves it. A refused cell keeps the grid's own layout, so it is drawn
  // Where it was attempted and the grid is left as it was
  const getPreview = (cell: GridBlock, landingLayout: GridItem[]): GridPreview => {
    const landedLayout = placeMove(landingLayout, cell, getOptions());
    if (!landedLayout) return { cell, isRefused: true, layout: layout.value };

    return { cell: landedLayout.find(({ id }) => id === cell.id) ?? cell, isRefused: false, layout: landedLayout };
  };
  // An item dropped with its top-left under the point lands in the columns and below the top, on the layout it is not yet
  // Part of, so its collisions resolve as a move's do
  const getDropPreview = (item: GridItem, point: GridPoint): GridPreview | undefined => {
    const element = root.value;
    if (!element || !getOptions().isEditable) return undefined;

    const { left, top } = element.getBoundingClientRect();
    const { padding } = getOptions().spacing;
    const offset = { x: point.x - left - padding, y: point.y - top - padding };
    const columnIndex = Math.floor(offset.x / columnPitch.value);
    const rowIndex = Math.floor(offset.y / rowPitch.value);
    const cell = clampCell({ ...item, x: columnIndex, y: rowIndex }, getOptions().columnNumber);
    return getPreview(cell, [...layout.value, cell]);
  };

  // A press starts a gesture, which becomes a drag only past the start distance, so a press that barely moves stays a click
  const startGesture = (event: PointerEvent, item: T, edge?: ResizeEdge) => {
    // Only the primary button starts a gesture, since a touch or pen contact reports button 0 too
    if (event.button !== 0) return;
    if (!getOptions().isEditable || checkIsNestedControl(event)) return;
    // A resize is a handle's, and a touch does not resize, so a touch press that names an edge starts nothing. A touch on
    // The body still moves the item
    if (edge && event.pointerType === "touch") return;
    // An auto-height item takes its height from its content, so an edge that pulls its height starts nothing on it
    if (item.isAutoHeight && edge && checkChangesHeight(edge)) return;
    // A held gesture belongs to the pointer that began it, so another pointer's press waits for its release
    if (gesture.value && gesture.value.pointerId !== event.pointerId) return;
    if (!(event.currentTarget instanceof Element)) return;

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
    if (isCellChanged) gesturePreview.value = getPreview(cell, layout.value);
  };
  // The cells of a layout that differ from the saved one, or are new to it, in the form the consumer writes back
  const getChangedCells = (changedLayout: GridBlock[]): GridBlock[] =>
    changedLayout.flatMap((item): GridBlock[] => {
      const savedItem = savedItemMap.value.get(item.id);
      return !savedItem || !checkIsSameCell(item, savedItem)
        ? [{ h: item.h, id: item.id, w: item.w, x: item.x, y: item.y }]
        : [];
    });
  // A dropped item lands on the cell its drop previews. Under prevent a drop that lands on another item is refused, so nothing is
  // Committed and no cell is returned. The dropped item is not part of the changes, since the consumer adds it at the cell returned
  const accept = (item: GridItem, point: GridPoint): GridCell | undefined => {
    const preview = getDropPreview(item, point);
    if (!preview || preview.isRefused) return undefined;

    const changes = getChangedCells(preview.layout).filter(({ id }) => id !== item.id);
    if (changes.length > 0) getOptions().onCommit({ changes });
    const { h, w, x, y } = preview.cell;
    return { h, w, x, y };
  };
  // A keyboard step places an item as a gesture places it, and commits the changes once when it lands. A step that lands where
  // The item already is, leaves the columns or is refused under prevent changes nothing and returns false
  const stepItem = (id: string, step: GridStep): boolean => {
    const item = layout.value.find((other) => other.id === id);
    if (!getOptions().isEditable || !item) return false;

    const { dh = 0, dw = 0, dx = 0, dy = 0 } = step;
    // An auto-height item takes its height from its content, so a step that would change its height changes nothing
    if (item.isAutoHeight && dh !== 0) return false;

    const target = {
      ...item,
      h: Math.max(GRID_MIN_SPAN, item.h + dh),
      w: Math.max(GRID_MIN_SPAN, item.w + dw),
      x: item.x + dx,
      y: item.y + dy,
    };
    // A step that would leave the grid, past its top, left or last column, changes nothing rather than being pulled back in
    const isOutside = target.x < 0 || target.y < 0 || target.x + target.w > getOptions().columnNumber;
    if (isOutside || checkIsSameCell(target, item)) return false;

    const preview = getPreview(target, layout.value);
    const changes = preview.isRefused ? [] : getChangedCells(preview.layout);
    if (changes.length === 0) return false;

    getOptions().onCommit({ changes });
    return true;
  };
  // A release over this grid writes the cells its drag previewed, once. A drag the mode refuses leaves the layout as it was,
  // So it writes nothing
  const handlePointerUp = (event: PointerEvent) => {
    const activeGesture = gesture.value;
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;

    const preview = gesturePreview.value;
    const changes = preview && !preview.isRefused ? getChangedCells(preview.layout) : [];
    resetGesture();
    if (changes.length > 0) getOptions().onCommit({ changes });
  };
  // An auto-height item takes the whole rows that hold its reported content, and the layout compacts around it, as one commit
  const reportContentHeight = (id: string, contentHeight: number) => {
    const savedItem = savedItemMap.value.get(id);
    if (!getOptions().isEditable || !savedItem?.isAutoHeight) return;

    const h = getCellSpan(contentHeight, rowPitch.value, getOptions().spacing.gap);
    if (h === savedItem.h) return;

    const otherItems = getOptions().items.filter((item) => item.id !== id);
    const changes = getChangedCells(
      fitLayout([...otherItems, { ...savedItem, h }], getOptions().columnNumber, getOptions().compactType),
    );
    if (changes.length > 0) getOptions().onCommit({ changes });
  };
  const handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId === gesture.value?.pointerId) resetGesture();
  };

  // The element, its observer and the listeners' controller are held from mount, so unmount detaches what mount attached
  const attached = shallowRef<{ controller: AbortController; element: HTMLElement; observer: ResizeObserver }>();
  // The grid as the registry holds it, which an external drag previews over and drops onto
  const self: MountedGrid = {
    accept,
    clearPreview: () => {
      externalPreview.value = undefined;
    },
    preview: (item, point) => {
      const preview = getDropPreview(item, point);
      // A pointer moving within the cell it is over previews the same layout, so the held preview is kept, not redrawn
      const current = externalPreview.value;
      if (preview && current?.cell.id === preview.cell.id && checkIsSameCell(preview.cell, current.cell)) return;

      externalPreview.value = preview;
    },
  };
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
    mountedGrids.set(element, self);
    attached.value = { controller, element, observer };
  });
  onUnmounted(() => {
    if (!attached.value) return;

    const { controller, element, observer } = attached.value;
    observer.disconnect();
    mountedGrids.delete(element);
    controller.abort();
  });

  return { gridHeight, placeholder, reportContentHeight, startGesture, stepItem, tiles };
};
