<script setup lang="ts">
import type { EditorToolbarGroup } from "@/models/editor/EditorToolbarGroup";

import { useInsertWhiteboardImages } from "@/composables/whiteboard/useInsertWhiteboardImages";
import { EditorToolbarGroupKind } from "@/models/editor/EditorToolbarGroupKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { WHITEBOARD_IMAGE_ACCEPT, WHITEBOARD_SHAPE_TOOL_ITEM } from "@/services/whiteboard/tool/constants";
import { WhiteboardShapeItemMap } from "@/services/whiteboard/tool/WhiteboardShapeItemMap";
import { WhiteboardToolItemMap } from "@/services/whiteboard/tool/WhiteboardToolItemMap";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// Every tool a whiteboard is drawn with, in one toolbar: the select and hand tools, the shape slot, the drawing tools and the image picker.
// The lock that keeps a tool in hand sits here too.
// The toolbar holds one value for the tool in hand, and a shape tool's value is the kind it places.
// The slot draws that kind, and a choice in it or by a key sets both
const whiteboardEditorStore = useWhiteboardEditorStore();
const { isToolLocked, shapeKind, tool } = storeToRefs(whiteboardEditorStore);
const { toggleToolLock } = whiteboardEditorStore;
const insertImages = useInsertWhiteboardImages();
const imageInput = useTemplateRef("imageInput");
const toolbarValue = computed({
  get: () => (tool.value === GestureTool.Shape ? shapeKind.value : tool.value),
  set: (value) => {
    const shapeItem = Object.values(WhiteboardShapeItemMap).find((item) => item.value === value);
    const toolItem = Object.values(WhiteboardToolItemMap).find((item) => item.value === value);
    if (shapeItem) {
      tool.value = GestureTool.Shape;
      shapeKind.value = shapeItem.value;
    } else if (toolItem) tool.value = toolItem.value;
  },
});
const groups = computed<EditorToolbarGroup[]>(() => [
  {
    items: [WhiteboardToolItemMap[GestureTool.Select], WhiteboardToolItemMap[GestureTool.Hand]],
    kind: EditorToolbarGroupKind.Tool,
    label: "Select and pan",
  },
  { items: [WHITEBOARD_SHAPE_TOOL_ITEM], kind: EditorToolbarGroupKind.Tool, label: "Shape" },
  {
    items: [
      WhiteboardToolItemMap[GestureTool.Arrow],
      WhiteboardToolItemMap[GestureTool.Freehand],
      WhiteboardToolItemMap[GestureTool.Text],
      WhiteboardToolItemMap[GestureTool.StickyNote],
    ],
    kind: EditorToolbarGroupKind.Tool,
    label: "Draw",
  },
  {
    items: [
      {
        meaning: UiIconMeaning.Image,
        onClick: () => {
          imageInput.value?.open();
        },
        title: "Image",
        value: "image",
      },
    ],
    kind: EditorToolbarGroupKind.Command,
    label: "Insert",
  },
  {
    items: [
      {
        isPressed: isToolLocked.value,
        meaning: UiIconMeaning.Lock,
        onClick: toggleToolLock,
        title: "Lock the tool",
        value: "lock",
      },
    ],
    kind: EditorToolbarGroupKind.Command,
    label: "Lock",
  },
]);
</script>

<template>
  <EditorToolbar v-model="toolbarValue" label="Whiteboard tools" :groups />
  <UiHiddenFileInput
    ref="imageInput"
    :accept="WHITEBOARD_IMAGE_ACCEPT"
    @select="
      (file) => {
        imageInput?.reset();
        if (file) insertImages([file]);
      }
    "
  />
</template>
