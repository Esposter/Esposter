// @unocss-include
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Item } from "@/models/shared/Item";

import { ChartableColumnTypes } from "@/services/resource/sheet/column/ChartableColumnTypes";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";
import { getDeleteColumnDescription } from "@/services/resource/sheet/commands/getDeleteColumnDescription";
import { getEditColumnDescription } from "@/services/resource/sheet/commands/getEditColumnDescription";
import { getToggleColumnVisibilityDescription } from "@/services/resource/sheet/commands/getToggleColumnVisibilityDescription";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";

// A column's commands, which its row's overflow button, its row's context menu and its header in the grid all open,
// So none of them offers what the others do not
export const useColumnActionItems = () => {
  const columnDialogStore = useColumnDialogStore();
  const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
  const toggleColumnVisibility = useToggleColumnVisibility();
  // It asks nothing first: the toolbar's Undo brings the column and its values back
  const deleteColumn = useDeleteColumn();
  const getColumnActionItems = (column: Column): Item[] => [
    ...(ChartableColumnTypes.has(getEffectiveColumnType(column))
      ? [
          {
            icon: "i-mdi:chart-bar",
            onClick: () => {
              chartingColumnName.value = column.name;
            },
            title: "Chart",
          },
        ]
      : []),
    {
      icon: column.isHidden ? "i-mdi:eye" : "i-mdi:eye-off",
      onClick: async () => {
        await toggleColumnVisibility(column.id);
      },
      title: getToggleColumnVisibilityDescription(column.name, column.isHidden),
    },
    {
      icon: "i-mdi:pencil",
      onClick: () => {
        editingColumnName.value = column.name;
      },
      title: getEditColumnDescription(column.name),
    },
    {
      icon: "i-mdi:delete",
      isDanger: true,
      isGroupStart: true,
      onClick: async () => {
        await deleteColumn(column.name);
      },
      title: getDeleteColumnDescription(column.name),
    },
  ];
  return { getColumnActionItems };
};
