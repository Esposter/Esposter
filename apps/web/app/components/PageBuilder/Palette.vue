<script setup lang="ts">
import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { BlockNode } from "headless-block-editor";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <div grid cols="[repeat(auto-fill,minmax(4.25rem,1fr))]" gap-1>
    <template v-for="{ category, types } of kind.paletteCategories" :key="category">
      <h3 ui-title text-muted col-span-full>{{ category }}</h3>
      <UiButton
        v-for="type of types"
        :key="type"
        aspect-square
        w-full
        @click="insert(type)"
        @pointerdown="startDrag(type, $event)"
      >
        <span flex flex-col items-center justify-center gap-1 h-full text-center>
          <UiIcon v-if="kind.icons[type]" :meaning="kind.icons[type]" />
          {{ kind.titles[type] }}
        </span>
      </UiButton>
    </template>
    <h3 v-if="mergeFieldColumns.length > 0" ui-title text-muted col-span-full>Merge fields</h3>
    <UiButton
      v-for="columnName of mergeFieldColumns"
      :key="columnName"
      aspect-square
      w-full
      @click="insertMergeField(columnName)"
      @pointerdown="startColumnDrag(columnName, $event)"
    >
      <span flex flex-col items-center justify-center gap-1 h-full text-center>
        <UiIcon :meaning="UiIconMeaning.Tag" />
        {{ columnName }}
      </span>
    </UiButton>
  </div>
</template>
