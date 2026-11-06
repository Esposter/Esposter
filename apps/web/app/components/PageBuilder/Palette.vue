<script setup lang="ts">
import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";
import type { BlockNode } from "vue-block-editor-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { MERGE_FIELD_KIND_PREFIX } from "@/services/pageBuilder/constants";
import { createMergeFieldNode } from "@/services/pageBuilder/email/createMergeFieldNode";
import { getMergeFieldColumnName } from "@/services/pageBuilder/getMergeFieldColumnName";
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
const { getInsertable, insert } = usePageBuilderInsert(kind, getDocument, () => resourceId, announce);
// The columns of the dataset an email is bound to, which an email's blade holds in the store, so a webpage lists none
const mergeFieldColumns = useMergeFieldColumns(() => resourceId);
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
// A type with no icon or no title is left out, rather than drawn with one the kind does not give it. A type no slot at the
// Selection takes is left out the same way, and a group left with nothing in it is not drawn
const groups = computed<PaletteGroup[]>(() => {
  const categoryGroups = kind.paletteCategories
    .map(({ category, types }) => ({
      items: getInsertable(types).flatMap((type) => {
        const icon = kind.icons[type];
        const title = kind.titles[type];
        if (icon === undefined || title === undefined) return [];

        return [{ icon, kind: type, title }];
      }),
      title: category,
    }))
    .filter(({ items }) => items.length > 0);
  // A merge field inserts a text, so its column is offered only where a text can be inserted
  if (mergeFieldColumns.value.length === 0 || getInsertable([MjmlNodeType.Text]).length === 0) return categoryGroups;

  return [
    ...categoryGroups,
    {
      items: mergeFieldColumns.value.map((columnName) => ({
        icon: UiIconMeaning.Tag,
        kind: `${MERGE_FIELD_KIND_PREFIX}${columnName}`,
        title: columnName,
      })),
      title: "Merge fields",
    },
  ];
});
// A palette item's kind names either a block type or a merge field's column, so a click and a drag each take whichever
// It names
const insertItem = (itemKind: string) => {
  const columnName = getMergeFieldColumnName(itemKind);
  if (columnName === undefined) insert(itemKind);
  else insertMergeField(columnName);
};
const dragItem = (itemKind: string, event: PointerEvent) => {
  const columnName = getMergeFieldColumnName(itemKind);
  if (columnName === undefined) startDrag(itemKind, event);
  else startColumnDrag(columnName, event);
};
</script>

<template>
  <UiPalette :groups @insert="insertItem" @drag-start="dragItem" />
</template>
