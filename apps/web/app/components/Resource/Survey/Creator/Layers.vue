<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyNode } from "survey-engine";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { parseArrayIndex, parseJsonPointer, readJsonValue, toJsonPointer } from "@esposter/shared";
import { getAcceptingSlotPointers, getBlockLayerRows, getBlockNode } from "headless-block-editor";
import { surveyNodeChildren, surveyNodeTypeDefinitionMap, surveyRegistry } from "survey-engine";

// A row of the tree: a node's depth below the survey's pages, read as the indent before its title
type LayerItem = UiListItem<string> & { depth: number };

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedPointer } = storeToRefs(surveyCreatorStore);
const { duplicateNode, moveNodeTo, removeNode, select } = useSurveyCreatorCommands();
// What a node is called in the tree and in a path: its title, else its name, else the label of its kind
const getNodeLabel = (node: SurveyNode) =>
  ("title" in node.props && node.props.title) ||
  ("name" in node.props && node.props.name) ||
  surveyNodeTypeDefinitionMap[node.type].label;
// A node's slot is its pointer without the node's own index, and the node's place is that index
const getSlotPointer = (pointer: string) => toJsonPointer(parseJsonPointer(pointer).slice(0, -1));
const getIndex = (pointer: string) => parseArrayIndex(parseJsonPointer(pointer).at(-1) ?? "", Number.MAX_SAFE_INTEGER);
// Each row of the document in layer order, the rows of a node's slots following the node
const layerItems = computed<LayerItem[]>(() =>
  getBlockLayerRows(surveyDocument.value, surveyNodeChildren).flatMap(({ depth, nodePointer }) => {
    const node = getBlockNode(surveyDocument.value, nodePointer, surveyNodeChildren);
    if (!node) return [];

    return [
      {
        depth,
        description: surveyNodeTypeDefinitionMap[node.type].label,
        hasLeadingSlot: true,
        isCurrent: selectedPointer.value === nodePointer,
        title: getNodeLabel(node),
        value: nodePointer,
      },
    ];
  }),
);
// A slot is named the way Move to names it: "The survey" for the pages, else the titles of the nodes it sits under
const getSlotPath = (slotPointer: string) => {
  if (slotPointer === "/content") return "The survey";

  // A node's pointer is its slot's pointer plus one index, so the owning node sits two segments before the slot's own key
  // And each node on the way down is three segments after the one before it
  const ownerSegments = parseJsonPointer(slotPointer).slice(0, -2);
  const titles: string[] = [];
  for (let length = 2; length <= ownerSegments.length; length += 3) {
    const node = getBlockNode(surveyDocument.value, toJsonPointer(ownerSegments.slice(0, length)), surveyNodeChildren);
    if (node) titles.push(getNodeLabel(node));
  }
  return titles.join(" › ");
};
// The places the node being moved may go, each a slot that accepts its type, so Move to is one choice rather than a search
const movingPointer = ref("");
const isMoveOpen = ref(false);
const moveItems = computed<UiListItem<string>[]>(() =>
  getAcceptingSlotPointers(surveyDocument.value, surveyRegistry, surveyNodeChildren, movingPointer.value).map(
    (slotPointer) => ({ meaning: UiIconMeaning.ArrowRight, title: getSlotPath(slotPointer), value: slotPointer }),
  ),
);
const openMoveTo = (pointer: string) => {
  movingPointer.value = pointer;
  isMoveOpen.value = true;
};
// A node taken out of the slot it is in leaves that slot one shorter, so the end of that slot is one index less
const moveTo = (slotPointer: string) => {
  const slotNodes = readJsonValue(surveyDocument.value, parseJsonPointer(slotPointer));
  const sameSlotOffset = getSlotPointer(movingPointer.value) === slotPointer ? 1 : 0;
  const index = Array.isArray(slotNodes) ? slotNodes.length - sameSlotOffset : 0;
  moveNodeTo(movingPointer.value, slotPointer, index);
  isMoveOpen.value = false;
};
// Removing a node takes what it holds with it, so it is asked for first
const removingPointer = ref("");
const isRemoveOpen = ref(false);
const askRemove = (pointer: string) => {
  removingPointer.value = pointer;
  isRemoveOpen.value = true;
};
// What a row's overflow menu does to the node it is of: copy it, move it to a chosen place or ask to remove it
const getActionItems = (pointer: string): Item[] => [
  {
    meaning: UiIconMeaning.Copy,
    onClick: () => {
      duplicateNode(pointer);
    },
    title: "Duplicate",
  },
  {
    meaning: UiIconMeaning.Forward,
    onClick: () => {
      openMoveTo(pointer);
    },
    title: "Move to…",
  },
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      askRemove(pointer);
    },
    title: "Remove",
  },
];
// Each row's menu is read from one map, so the list is not rebuilt for every row on every render
const actionItemsMap = computed(
  () => new Map(layerItems.value.map(({ value }): [string, Item[]] => [value, getActionItems(value)])),
);
// The row being dragged, held while a drag is under way and empty otherwise
const draggedPointer = ref("");
// A drop beside a row, before it or after it by the half of the row the pointer is over, places the held node in that row's
// Slot. The core refuses a slot that takes no node of its type, and a slot inside the node itself
const moveBeside = (targetPointer: string, event: DragEvent) => {
  const targetIndex = getIndex(targetPointer);
  if (!draggedPointer.value || targetIndex === undefined || !(event.currentTarget instanceof HTMLElement)) return;

  const { bottom, top } = event.currentTarget.getBoundingClientRect();
  const slotPointer = getSlotPointer(targetPointer);
  let index = targetIndex + (event.clientY > (top + bottom) / 2 ? 1 : 0);
  // A node dragged from earlier in the same slot leaves the place one index less once it is taken out
  const draggedIndex = getIndex(draggedPointer.value);
  if (getSlotPointer(draggedPointer.value) === slotPointer && draggedIndex !== undefined && draggedIndex < index)
    index -= 1;
  moveNodeTo(draggedPointer.value, slotPointer, index);
};
// A row is dragged by its own press, and dropped beside another row to move there. The keyboard moves the selected node instead
const getRowProps = ({ value }: UiListItem<string>): Record<string, unknown> => ({
  "data-pointer": value,
  draggable: true,
  onDragend: () => {
    draggedPointer.value = "";
  },
  onDragover: (event: DragEvent) => {
    if (draggedPointer.value) event.preventDefault();
  },
  onDragstart: (event: DragEvent) => {
    draggedPointer.value = value;
    event.dataTransfer?.setData("text/plain", value);
  },
  onDrop: (event: DragEvent) => {
    event.preventDefault();
    moveBeside(value, event);
  },
});
const layers = useTemplateRef("layers");
// A move re-renders the moved row under its new pointer, so keyboard focus that was on it follows the node to its new row
watch(selectedPointer, async (pointer) => {
  if (!layers.value?.contains(window.document.activeElement)) return;

  await nextTick();
  layers.value?.querySelector<HTMLElement>(`[data-pointer="${CSS.escape(pointer)}"]`)?.focus();
});
</script>

<template>
  <div ref="layers" flex flex-col gap-2 min-h-0 of-y-auto>
    <UiList :get-row-props :items="layerItems" label="Layers" @select="(value) => select(value)">
      <template #leading="{ item }">
        <span aria-hidden="true" shrink-0 :style="{ width: `calc(var(--ui-step) * ${item.depth * 2})` }" />
      </template>
      <template #actions="{ item }">
        <UiOverflowMenu :items="actionItemsMap.get(item.value) ?? []" :label="`${item.title} actions`" />
      </template>
    </UiList>
    <UiDialog v-model="isMoveOpen" title="Move to">
      <div p-3 flex flex-col min-h-0 of-y-auto>
        <UiList
          v-if="moveItems.length > 0"
          :items="moveItems"
          label="Places it can move to"
          @select="(value) => moveTo(value)"
        />
        <p v-else text-muted>Nothing else in the survey takes it</p>
      </div>
    </UiDialog>
    <UiConfirmDialog
      v-model="isRemoveOpen"
      confirm-label="Remove"
      :confirm="() => removeNode(removingPointer)"
      title="Remove"
    >
      <p>Remove this and everything in it from the survey?</p>
    </UiConfirmDialog>
  </div>
</template>
