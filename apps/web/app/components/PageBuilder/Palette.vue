<script setup lang="ts">
import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { BlockNode } from "headless-block-editor";

import { createMergeFieldNode } from "@/services/pageBuilder/email/createMergeFieldNode";
import { MjmlNodeType } from "mjml-blocks";

interface Props {
  announce: (message: string) => void;
  getDocument: () => AnyPageBuilderDocument | undefined;
  // Both are the editor's, so a palette with no canvas beside it, as on an empty page, takes clicks alone
  getFrameGeometry?: () => FrameGeometry | undefined;
  kind: AnyPageBuilderKind;
  resourceId: string;
  startMergeFieldDrag?: (
    columnName: string,
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => void;
  startPaletteDrag?: (
    type: BlockNode["type"],
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => void;
}
const { announce, getDocument, getFrameGeometry, kind, resourceId, startMergeFieldDrag, startPaletteDrag } =
  defineProps<Props>();
const { insert } = usePageBuilderInsert(kind, getDocument, () => resourceId, announce);
// The columns of the dataset an email is bound to, which only an email's shell provides, so a webpage lists none
const mergeFieldColumns = useMergeFieldColumns();
const insertMergeField = (columnName: string) =>
  insert(MjmlNodeType.Text, (id) => createMergeFieldNode(columnName, id));

// A press starts a drag only where a frame can take the block or the column, so a press that has no frame stays a click
const hasFrame = () => getFrameGeometry?.() !== undefined;
const startDrag = (type: BlockNode["type"], event: PointerEvent) => {
  if (startPaletteDrag && getFrameGeometry && hasFrame()) startPaletteDrag(type, event, getFrameGeometry);
};
const startColumnDrag = (columnName: string, event: PointerEvent) => {
  if (startMergeFieldDrag && getFrameGeometry && hasFrame()) startMergeFieldDrag(columnName, event, getFrameGeometry);
};
</script>

<template>
  <div flex flex-col gap-4>
    <section v-for="{ category, types } of kind.paletteCategories" :key="category" flex flex-col gap-2>
      <h3 text-sm text-muted>{{ category }}</h3>
      <div flex flex-wrap gap-2>
        <UiButton v-for="type of types" :key="type" @click="insert(type)" @pointerdown="startDrag(type, $event)">{{
          kind.titles[type]
        }}</UiButton>
      </div>
    </section>
    <section v-if="mergeFieldColumns.length > 0" flex flex-col gap-2>
      <h3 text-sm text-muted>Merge fields</h3>
      <div flex flex-wrap gap-2>
        <UiButton
          v-for="columnName of mergeFieldColumns"
          :key="columnName"
          @click="insertMergeField(columnName)"
          @pointerdown="startColumnDrag(columnName, $event)"
          >{{ columnName }}</UiButton
        >
      </div>
    </section>
  </div>
</template>
