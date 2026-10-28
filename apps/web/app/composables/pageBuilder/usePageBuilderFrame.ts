import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { FramePlacement } from "@/models/pageBuilder/FramePlacement";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { Ref, ShallowRef } from "vue";

import { checkIsHorizontalFlow } from "@/services/pageBuilder/checkIsHorizontalFlow";
import { getToolbarPlacement } from "@/services/pageBuilder/getToolbarPlacement";
import { getFrameScale } from "vue-canvas-frame-headless";

// The frame is scaled to fit its pane, so the scale maps the frame's own pixels to the app's viewport
const getFrameScaleOf = (frameElement: HTMLIFrameElement) =>
  getFrameScale(frameElement.parentElement?.clientWidth ?? 0, frameElement.offsetWidth);
// The canvas's frame as the page builder reads it: a node's element in the frame, the frame's geometry for a palette drag, and
// Where the selection's toolbar sits in the app's viewport. The frame is the document the content root is drawn in
export const usePageBuilderFrame = (
  contentRoot: Readonly<ShallowRef<HTMLElement | null>>,
  hoveredNodeId: Readonly<Ref<string>>,
  selectionBox: Readonly<Ref<OverlayBox | undefined>>,
) => {
  const getElement = (nodeId: string) =>
    contentRoot.value?.ownerDocument.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`) ?? null;
  const getFrameElement = () => {
    const frameElement = contentRoot.value?.ownerDocument.defaultView?.frameElement;
    return frameElement instanceof HTMLIFrameElement ? frameElement : undefined;
  };
  // Whether a slot's owner lays its children out in a row, read from the owner's element in the frame
  const checkIsHorizontalOwner = (ownerId: string) => checkIsHorizontalFlow(getElement(ownerId));
  // The frame moves in the app's viewport when the app scrolls or its pane resizes, and neither changes the selection box, so
  // Its placement is read again on each. The toolbar sits in the app's document and is placed from that placement
  const framePlacement = shallowRef<FramePlacement>();
  const refreshFramePlacement = () => {
    const frameElement = getFrameElement();
    if (!frameElement) {
      framePlacement.value = undefined;
      return;
    }

    const frameRect = frameElement.getBoundingClientRect();
    framePlacement.value = {
      height: frameRect.height,
      left: frameRect.left,
      scale: getFrameScaleOf(frameElement),
      top: frameRect.top,
    };
  };
  // One read per animation frame, however many scrolls land before it
  let pendingFrame = 0;
  const scheduleFramePlacement = () => {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(refreshFramePlacement);
  };
  // Captured so a scroll in any container of the app reaches it, not only the window's own
  useEventListener("scroll", scheduleFramePlacement, { capture: true, passive: true });
  // The pane's size moves the frame's scale, and the device toggle changes the frame's own width without changing the pane's
  useResizeObserver(() => getFrameElement()?.parentElement, scheduleFramePlacement);
  useResizeObserver(getFrameElement, scheduleFramePlacement);
  watch(contentRoot, refreshFramePlacement, { flush: "post" });
  const toolbarPosition = computed(() => {
    if (!framePlacement.value || !selectionBox.value) return undefined;

    return getToolbarPlacement(selectionBox.value, framePlacement.value);
  });
  // What a palette drag reads of the frame, taken fresh at each call. A child's box is its raw viewport rect in the frame.
  // That is the same space the pointer is mapped into, so the drop logic is not offset by the frame's own scroll
  const getFrameGeometry = (): FrameGeometry | undefined => {
    const frameElement = getFrameElement();
    if (!frameElement) return undefined;

    const frameRect = frameElement.getBoundingClientRect();
    return {
      checkIsHorizontalOwner,
      frameRect: { height: frameRect.height, left: frameRect.left, top: frameRect.top, width: frameRect.width },
      getChildRect: (nodeId) => getElement(nodeId)?.getBoundingClientRect(),
      hoveredNodeId: hoveredNodeId.value,
      scale: getFrameScaleOf(frameElement),
    };
  };

  return { checkIsHorizontalOwner, getElement, getFrameGeometry, toolbarPosition };
};
