import type { Context } from "#src/models/Context";
import type { EditorLayout } from "#src/models/EditorLayout";
import type { Layout } from "#src/models/Layout";
import type { ReaderState } from "#src/models/ReaderState";
import type { SizeClass } from "#src/models/SizeClass";
import type { MaybeRefOrGetter } from "vue";

import { resizeRegion as baseResizeRegion } from "#src/services/resizeRegion";
import { resolveLayout } from "#src/services/resolveLayout";
import { setActivePanel as baseSetActivePanel } from "#src/services/setActivePanel";
import { toggleRegion as baseToggleRegion } from "#src/services/toggleRegion";
import { computed, shallowRef, toValue } from "vue";

// An editor's layout resolved for its reader. The layout, the context and the size class are read again whenever one changes, so the
// Resolved layout is always the one for the present state. The reader's state changes only through the three functions here, each of
// Which answers a new state and leaves the one it was given. The state starts as the one passed in, which the app reads back from its
// Store through parseReaderState, and the app stores the state this composable exposes
export const useEditorLayout = (
  layout: MaybeRefOrGetter<Layout>,
  context: MaybeRefOrGetter<Context>,
  sizeClass: MaybeRefOrGetter<SizeClass>,
  initialReaderState: ReaderState,
): EditorLayout => {
  const readerStateRef = shallowRef(initialReaderState);
  const readerState = computed(() => readerStateRef.value);
  const resolvedLayout = computed(() =>
    resolveLayout(toValue(layout), toValue(context), toValue(sizeClass), readerStateRef.value),
  );
  // A region is named by its id, and an id the layout does not name changes nothing
  const resizeRegion = (regionId: string, size: number): void => {
    const region = toValue(layout).regions.find((candidate) => candidate.id === regionId);
    if (region) readerStateRef.value = baseResizeRegion(region, readerStateRef.value, size);
  };
  // A region is toggled from the open state it is shown in, which is the one its resolved region carries
  const toggleRegion = (regionId: string): void => {
    const resolvedRegion = resolvedLayout.value.regions.find((candidate) => candidate.id === regionId);
    if (resolvedRegion) readerStateRef.value = baseToggleRegion(readerStateRef.value, regionId, resolvedRegion.isOpen);
  };
  const setActivePanel = (regionId: string, panelId: string): void => {
    readerStateRef.value = baseSetActivePanel(readerStateRef.value, regionId, panelId);
  };
  return { readerState, resizeRegion, resolvedLayout, setActivePanel, toggleRegion };
};
