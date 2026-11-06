import type { EditorRegistry } from "@/models/editor/EditorRegistry";

import ResourceWhiteboardEditorControls from "@/components/Resource/Whiteboard/EditorControls.vue";
import ResourceWhiteboardEditorPropertiesArrowPanel from "@/components/Resource/Whiteboard/EditorPropertiesArrowPanel.vue";
import ResourceWhiteboardEditorPropertiesPanel from "@/components/Resource/Whiteboard/EditorPropertiesPanel.vue";
import ResourceWhiteboardEditorPropertiesSeveralPanel from "@/components/Resource/Whiteboard/EditorPropertiesSeveralPanel.vue";
import ResourceWhiteboardEditorToolbar from "@/components/Resource/Whiteboard/EditorToolbar.vue";
import { WHITEBOARD_CONTENT_KEY } from "@/services/whiteboard/layout/constants";

// The component each content key of the whiteboard's layout draws, which the layout check holds to the keys the layout names
export const WhiteboardContentComponentMap: EditorRegistry = {
  [WHITEBOARD_CONTENT_KEY.Arrow]: ResourceWhiteboardEditorPropertiesArrowPanel,
  [WHITEBOARD_CONTENT_KEY.Element]: ResourceWhiteboardEditorPropertiesPanel,
  [WHITEBOARD_CONTENT_KEY.SeveralElements]: ResourceWhiteboardEditorPropertiesSeveralPanel,
  [WHITEBOARD_CONTENT_KEY.Tools]: ResourceWhiteboardEditorToolbar,
  [WHITEBOARD_CONTENT_KEY.View]: ResourceWhiteboardEditorControls,
};
