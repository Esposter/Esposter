<script setup lang="ts">
import type { DiffComment } from "@/models/agentConsole/DiffComment";
import type { DiffRow } from "@/models/agentConsole/DiffRow";
import type { FileEdit } from "@/models/agentConsole/FileEdit";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { DiffSide } from "@/models/agentConsole/DiffSide";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { DiffRowStyleMap } from "@/services/agentConsole/DiffRowStyleMap";
import { toDiffCommentKey } from "@/services/agentConsole/toDiffCommentKey";
import { toDiffRows } from "@/services/agentConsole/toDiffRows";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

interface Props {
  fileEdit: FileEdit;
  // Only a file's whole diff numbers its lines as the file has them, so a line of a single edit to a file whose text was
  // Not known takes no comment
  isCommentable?: true;
}

const { fileEdit, isCommentable } = defineProps<Props>();
const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { diffCommentMap } = storeToRefs(agentConsoleSessionStore);
const { deleteDiffComment, saveDiffComment } = agentConsoleSessionStore;
const rows = computed(() => toDiffRows(fileEdit.oldText, fileEdit.newText));
// The line whose comment box is open, and the text typed into it
const openedLine = ref<Omit<DiffComment, "text">>();
const commentText = ref("");

const openComment = (side: DiffSide, lineNumber: number, lineText: string) => {
  if (!isCommentable || !lineNumber) return;

  openedLine.value = { filePath: fileEdit.filePath, lineNumber, lineText, side };
  commentText.value = diffCommentMap.value.get(toDiffCommentKey(openedLine.value))?.text || "";
};
// An unchanged line is the same line on both sides, so it takes its comment on the new side alone, where the prompt
// Names it as it stands rather than as removed
const toOldLineNumber = (row: DiffRow) => (row.type === DiffRowType.Unchanged ? 0 : row.oldLineNumber);
// A commentable line is a button, so a keyboard opens its comment box as a click does
const toLineControlAttributes = (side: DiffSide, lineNumber: number) =>
  isCommentable && lineNumber
    ? {
        "aria-label": `Comment on ${side === DiffSide.Old ? "old" : "new"} line ${lineNumber}`,
        class: "cursor-pointer",
        role: "button",
        tabindex: 0,
      }
    : {};
// An emptied comment is removed rather than saved blank
const saveComment = () => {
  const line = openedLine.value;
  if (!line) return;

  if (commentText.value) saveDiffComment({ ...line, text: commentText.value });
  else deleteDiffComment(toDiffCommentKey(line));
  openedLine.value = undefined;
};
// The comment boxes a row draws under itself, one per side that has a line with its box open or a comment saved
const toRowCommentBoxes = (row: DiffRow) => {
  if (!isCommentable) return [];

  const sideLines = [
    { lineNumber: toOldLineNumber(row), lineText: row.oldLine, side: DiffSide.Old },
    { lineNumber: row.newLineNumber, lineText: row.newLine, side: DiffSide.New },
  ];
  return sideLines.flatMap(({ lineNumber, lineText, side }) => {
    if (!lineNumber) return [];

    const key = toDiffCommentKey({ filePath: fileEdit.filePath, lineNumber, side });
    const comment = diffCommentMap.value.get(key);
    const isOpened = openedLine.value !== undefined && toDiffCommentKey(openedLine.value) === key;
    return isOpened || comment ? [{ comment, isOpened, key, lineNumber, lineText, side }] : [];
  });
};
</script>

<template>
  <div of-x-auto>
    <div v-for="(row, index) of rows" :key="index" class="row" grid cols-2>
      <div v-if="row.type === DiffRowType.Collapsed" text-muted px-2 col-span-2>{{ row.oldLine }}</div>
      <template v-else>
        <div
          px-2
          ws-pre
          :style="DiffRowStyleMap[row.type].old"
          v-bind="toLineControlAttributes(DiffSide.Old, toOldLineNumber(row))"
          @click="openComment(DiffSide.Old, toOldLineNumber(row), row.oldLine)"
          @keydown.enter.self.prevent="openComment(DiffSide.Old, toOldLineNumber(row), row.oldLine)"
          @keydown.space.self.prevent="openComment(DiffSide.Old, toOldLineNumber(row), row.oldLine)"
        >
          {{ row.oldLine }}
        </div>
        <div
          px-2
          b-border
          b-l-2
          b-l-solid
          ws-pre
          :style="DiffRowStyleMap[row.type].new"
          v-bind="toLineControlAttributes(DiffSide.New, row.newLineNumber)"
          @click="openComment(DiffSide.New, row.newLineNumber, row.newLine)"
          @keydown.enter.self.prevent="openComment(DiffSide.New, row.newLineNumber, row.newLine)"
          @keydown.space.self.prevent="openComment(DiffSide.New, row.newLineNumber, row.newLine)"
        >
          {{ row.newLine }}
        </div>
        <template v-for="box of toRowCommentBoxes(row)" :key="box.key">
          <div v-if="box.isOpened" p-2 flex flex-col gap-2 col-span-2>
            <textarea
              v-model="commentText"
              aria-label="Comment on this line"
              placeholder="Comment on this line — Ctrl+Enter saves it"
              rows="2"
              px-2
              py-1
              resize-none
              ui-field
              @keydown.ctrl.enter="saveComment()"
            />
            <div flex gap-2 justify-end>
              <UiButton @click="openedLine = undefined">Cancel</UiButton>
              <UiButton @click="saveComment()">Save</UiButton>
            </div>
          </div>
          <div v-else-if="box.comment" p-2 flex gap-2 col-span-2 items-center>
            <span flex-1 ws-pre-wrap>{{ box.comment.text }}</span>
            <UiButton @click="openComment(box.side, box.lineNumber, box.lineText)">Edit</UiButton>
            <!-- eslint-disable vue/no-restricted-syntax -- a removal from the unsaved draft of comments, which sending them clears, so there is nothing to confirm -->
            <UiButton :variant="UiButtonVariant.Danger" @click="deleteDiffComment(box.key)">Remove</UiButton>
            <!-- eslint-enable vue/no-restricted-syntax -->
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Rows a long diff is scrolled past are skipped by layout and paint */
.row {
  content-visibility: auto;
  contain-intrinsic-size: auto 1.25rem;
}
</style>
