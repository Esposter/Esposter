<script setup lang="ts">
import type { EditorToolbarGroup } from "@/models/editor/EditorToolbarGroup";
import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";
import type { Item } from "@/models/shared/Item";

import { EditorToolbarGroupKind } from "@/models/editor/EditorToolbarGroupKind";
import { getToolbarFolds } from "@/services/editor/getToolbarFolds";
import { takeOne } from "@esposter/shared";

interface Props {
  // Each group's items in the order the bar draws them. A tool with variants is a group of its own, holding that tool
  groups: EditorToolbarGroup[];
  // The toolbar's accessible name, as a landmark
  label: string;
}
// The tool in hand, which a tool group chooses among
const modelValue = defineModel<string>({ default: "" });
const { groups } = defineProps<Props>();
const id = useId();
const toolbar = useTemplateRef("toolbar");
// The bar draws every item while it measures, and reads each item's width and the overflow button's once when its items
// Change, so the fold is a computation over those numbers and the toolbar's own width rather than a measure per frame
const isMeasuring = ref(false);
const itemWidths = shallowRef<number[]>([]);
const overflowWidth = ref(0);
// The bar and its groups space their items by one gap, so the bar's column gap is the gap every item takes after it
const gap = ref(0);
// Nothing folds until the observer has read the toolbar's width
const availableWidth = ref(Number.POSITIVE_INFINITY);
// The variant each slot last drew, by its group's label. A variant in hand is the one its slot draws, whether a click or a key put it there
const usedVariantValues = shallowReactive(new Map<string, string>());
const flatEntries = computed(() =>
  groups.flatMap(({ items, kind, label: groupLabel }) => items.map((item) => ({ item, kind, label: groupLabel }))),
);
// The items always held in the overflow menu, which the bar never draws
const heldEntries = computed(() => flatEntries.value.filter(({ item }) => item.isInOverflow));
const isOverflowHeld = computed(() => heldEntries.value.length > 0);
// The items the bar draws and measures, in the order it draws them. An item held in the overflow menu is never drawn, so it
// Takes no width and is not one of the measured items
const drawnEntries = computed(() => flatEntries.value.filter(({ item }) => !item.isInOverflow));
const drawnFolds = computed(() => {
  if (isMeasuring.value) return drawnEntries.value.map(() => false);

  return getToolbarFolds({
    availableWidth: availableWidth.value,
    gap: gap.value,
    isOverflowHeld: isOverflowHeld.value,
    items: drawnEntries.value.map(({ item }, index) => ({
      isPinned: item.isPinned,
      width: itemWidths.value[index] ?? 0,
    })),
    overflowWidth: overflowWidth.value,
  });
});
// The overflow menu holds the items always held there, and the drawn items that do not fit
const foldedValues = computed(
  () =>
    new Set([
      ...heldEntries.value.map(({ item }) => item.value),
      ...drawnEntries.value.filter((_entry, index) => drawnFolds.value[index]).map(({ item }) => item.value),
    ]),
);
const foldedEntries = computed(() => flatEntries.value.filter(({ item }) => foldedValues.value.has(item.value)));
const visibleGroups = computed(() =>
  groups
    .map((group) => ({ ...group, items: group.items.filter(({ value }) => !foldedValues.value.has(value)) }))
    .filter(({ items }) => items.length > 0),
);
const getDescriptionId = (value: string) => `${id}-${value}`;
// The variant a slot draws: the one the tool in hand is, else the one last drawn in the slot, else the first
const getShownVariant = (variants: EditorToolbarItem[], groupLabel: string) => {
  const inHandVariant = variants.find(({ value }) => value === modelValue.value);
  const lastUsedVariant = variants.find(({ value }) => value === usedVariantValues.get(groupLabel));
  return inHandVariant ?? lastUsedVariant ?? takeOne(variants);
};
const chooseVariant = (value: string) => {
  modelValue.value = value;
};
const getSlot = ({ title, value, variants = [] }: EditorToolbarItem, groupLabel: string) => {
  const shownVariant = getShownVariant(variants, groupLabel);

  return {
    isPressed: variants.some((variant) => variant.value === modelValue.value),
    meaning: shownVariant.meaning,
    menuItems: variants.map(({ description, isDisabled, meaning, title: variantTitle, value: variantValue }) => ({
      description,
      isDisabled,
      isSelected: variantValue === shownVariant.value,
      meaning,
      title: variantTitle,
      value: variantValue,
    })),
    title,
    value,
  };
};
const views = computed(() =>
  visibleGroups.value.map(({ items, kind, label: groupLabel }) => {
    const [family] = items;

    return {
      items,
      kind,
      label: groupLabel,
      slot: items.length === 1 && family?.variants !== undefined ? getSlot(family, groupLabel) : undefined,
      toggleItems: items.map(({ description, isDisabled, meaning, title, value }) => ({
        description,
        isDisabled,
        meaning,
        title,
        value,
      })),
    };
  }),
);
// What a folded item becomes in the overflow menu, which runs it as the bar would. A disabled one is listed, not run
const foldedMenuItems = computed<Item[]>(() =>
  foldedEntries.value.map(({ item, kind, label: groupLabel }) => {
    if (item.variants !== undefined) {
      const shownVariant = getShownVariant(item.variants, groupLabel);

      return {
        disabled: item.isDisabled,
        meaning: shownVariant.meaning,
        onClick: item.isDisabled
          ? undefined
          : () => {
              chooseVariant(shownVariant.value);
            },
        title: shownVariant.title,
      };
    }

    if (kind === EditorToolbarGroupKind.Tool)
      return {
        disabled: item.isDisabled,
        isSelected: item.value === modelValue.value,
        meaning: item.meaning,
        onClick: item.isDisabled
          ? undefined
          : () => {
              modelValue.value = item.value;
            },
        title: item.title,
      };

    return {
      disabled: item.isDisabled,
      isChecked: item.isPressed,
      meaning: item.meaning,
      onClick: item.isDisabled ? undefined : item.onClick,
      title: item.title,
    };
  }),
);
const measure = async () => {
  isMeasuring.value = true;
  await nextTick();
  const itemElements = toolbar.value?.querySelectorAll('[role="radio"], [data-toolbar-item]') ?? [];
  itemWidths.value = Array.from(itemElements, (element) => element.getBoundingClientRect().width);
  overflowWidth.value = toolbar.value?.querySelector("[data-toolbar-overflow]")?.getBoundingClientRect().width ?? 0;
  const bar = toolbar.value;
  // A gap the browser does not report (a computed style with none, as happy-dom gives) reads NaN, which is no gap
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- computed styles are px-suffixed ("4px"), Number() would be NaN
  gap.value = bar ? Number.parseFloat(window.getComputedStyle(bar).columnGap) || 0 : 0;
  isMeasuring.value = false;
};

useResizeObserver(toolbar, (entries) => {
  const entry = takeOne(entries);
  availableWidth.value = entry.contentRect.width;
});
onMounted(async () => {
  await measure();
});
watch(flatEntries, async () => {
  await measure();
});
// The slot of a variant in hand draws that variant from then on, so a choice a key makes is the one the slot shows once the tool moves on
watchImmediate(modelValue, (value) => {
  for (const { items, label: groupLabel } of groups) {
    const [family] = items;
    if (family?.variants?.some((variant) => variant.value === value)) usedVariantValues.set(groupLabel, value);
  }
});
</script>

<template>
  <div ref="toolbar" role="toolbar" :aria-label="label" p-1 flex gap-1 min-w-0 items-center ui-lifted>
    <div v-for="view of views" :key="view.label" role="group" :aria-label="view.label" flex gap-1 items-center>
      <template v-if="view.slot">
        <UiMenu
          :aria-pressed="view.slot.isPressed"
          :data-toolbar-item="view.slot.value"
          :items="view.slot.menuItems"
          :label="view.slot.title"
          @select="(value) => chooseVariant(value)"
        >
          <UiIcon :meaning="view.slot.meaning" />
        </UiMenu>
      </template>
      <UiToggleGroup
        v-else-if="view.kind === EditorToolbarGroupKind.Tool"
        v-model="modelValue"
        :items="view.toggleItems"
        :label="view.label"
        is-icon-only
      />
      <template v-else>
        <template v-for="item of view.items" :key="item.value">
          <UiIconButton
            class="aria-disabled:op-disabled"
            :aria-describedby="item.description ? getDescriptionId(item.value) : undefined"
            :aria-disabled="item.isDisabled || undefined"
            :aria-pressed="item.isPressed"
            :data-toolbar-item="item.value"
            :label="item.title"
            :meaning="item.meaning"
            :shortcut="item.shortcut"
            @click="
              async () => {
                if (!item.isDisabled) await item.onClick?.();
              }
            "
          />
          <span v-if="item.description" :id="getDescriptionId(item.value)" hidden>{{ item.description }}</span>
        </template>
      </template>
    </div>
    <UiOverflowMenu
      v-if="isMeasuring || foldedMenuItems.length > 0"
      :items="foldedMenuItems"
      :label="`More ${label}`"
      data-toolbar-overflow
    />
  </div>
</template>
