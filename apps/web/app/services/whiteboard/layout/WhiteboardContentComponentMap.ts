import type { EditorRegistry } from "#src/models/editor/EditorRegistry";

import ResourceWhiteboardEditorControls from "#src/components/Resource/Whiteboard/Editor/Controls.vue";
import ResourceWhiteboardEditorPropertiesArrowPanel from "#src/components/Resource/Whiteboard/Editor/Properties/ArrowPanel.vue";
import ResourceWhiteboardEditorPropertiesPanel from "#src/components/Resource/Whiteboard/Editor/Properties/Panel.vue";
import ResourceWhiteboardEditorPropertiesSeveralPanel from "#src/components/Resource/Whiteboard/Editor/Properties/SeveralPanel.vue";
import ResourceWhiteboardEditorToolbar from "#src/components/Resource/Whiteboard/Editor/Toolbar.vue";
import { WHITEBOARD_CONTENT_KEY } from "#src/services/whiteboard/layout/constants";

// The component each content key of the whiteboard's layout draws, which the layout check holds to the keys the layout names
export const WhiteboardContentComponentMap: EditorRegistry = {
  [WHITEBOARD_CONTENT_KEY.Arrow]: ResourceWhiteboardEditorPropertiesArrowPanel,
  [WHITEBOARD_CONTENT_KEY.Element]: ResourceWhiteboardEditorPropertiesPanel,
  [WHITEBOARD_CONTENT_KEY.SeveralElements]: ResourceWhiteboardEditorPropertiesSeveralPanel,
  [WHITEBOARD_CONTENT_KEY.Tools]: ResourceWhiteboardEditorToolbar,
  [WHITEBOARD_CONTENT_KEY.View]: ResourceWhiteboardEditorControls,
};
