import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { Ref, ShallowRef } from "vue";

import { checkIsHorizontalFlow } from "@/services/pageBuilder/checkIsHorizontalFlow";
import { getFrameScale } from "vue-canvas-frame-headless";

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
  // The frame is scaled to fit its pane, so the scale maps the frame's own pixels to the app's viewport
  const getFrameScaleOf = (frameElement: HTMLIFrameElement) =>
    getFrameScale(frameElement.parentElement?.clientWidth ?? 0, frameElement.offsetWidth);
  // The toolbar sits in the app's document, so the selection box is mapped into the app's viewport through the frame's element
  // The frame is scaled to fit its pane while the box is in the frame's own unscaled pixels, so the scale applies to the box
  const toolbarPosition = computed(() => {
    const frameElement = getFrameElement();
    if (!frameElement || !selectionBox.value) return undefined;

    const scale = getFrameScaleOf(frameElement);
    const frameRect = frameElement.getBoundingClientRect();
    return {
      left: frameRect.left + selectionBox.value.left * scale,
      top: frameRect.top + selectionBox.value.top * scale,
    };
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
