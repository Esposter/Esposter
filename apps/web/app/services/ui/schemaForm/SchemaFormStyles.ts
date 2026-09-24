// @unocss-include
import type { Styles } from "@jsonforms/vue-vanilla";

// The class names JSON Forms' own renderers draw objects, groups and arrays with, in the library's surfaces, so the
// Layout it generates reads as the rest of the app. Fields are the library's own renderers and take none of these
export const SchemaFormStyles: Styles = {
  arrayList: {
    addButton: "ui-button",
    item: "flex flex-col gap-3 p-3 ui-frame",
    itemContent: "flex flex-col gap-3",
    itemDelete: "ui-button",
    itemLabel: "flex-1 truncate",
    itemMoveDown: "ui-button",
    itemMoveUp: "ui-button",
    itemToolbar: "flex gap-1 items-center",
    itemWrapper: "flex flex-col gap-2",
    label: "flex-1 text-heading-color",
    legend: "flex gap-2 items-center",
    noData: "text-muted",
    root: "flex flex-col gap-2",
  },
  categorization: {},
  control: {},
  dialog: {},
  group: { item: "flex flex-col", label: "text-heading-color", root: "flex flex-col gap-3 p-3 ui-frame" },
  horizontalLayout: { item: "flex-1 min-w-0", root: "flex flex-wrap gap-4" },
  label: { root: "text-heading-color" },
  oneOf: {},
  verticalLayout: { item: "flex flex-col", root: "flex flex-col gap-4" },
};
