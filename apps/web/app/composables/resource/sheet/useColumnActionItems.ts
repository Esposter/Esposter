import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Item } from "#src/models/shared/Item";

import { getEffectiveColumnType } from "#shared/services/resource/sheet/column/getEffectiveColumnType";
import { getToggleColumnVisibilityDescription } from "#shared/services/resource/sheet/commands/getToggleColumnVisibilityDescription";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { ChartableColumnTypes } from "#src/services/resource/sheet/column/ChartableColumnTypes";
import { getDeleteColumnDescription } from "#src/services/resource/sheet/commands/getDeleteColumnDescription";
import { getEditColumnDescription } from "#src/services/resource/sheet/commands/getEditColumnDescription";
import { useColumnDialogStore } from "#src/store/resource/sheet/columnDialog";

// A column's commands, which its row's overflow button, its row's context menu and its header in the grid all open,
// So none of them offers what the others do not
export const useColumnActionItems = () => {
  const columnDialogStore = useColumnDialogStore();
  const { chartingColumnName, deletingColumnIds, editingColumnName } = storeToRefs(columnDialogStore);
  const toggleColumnVisibility = useToggleColumnVisibility();
  const getColumnActionItems = (column: Column): Item[] => [
    ...(ChartableColumnTypes.has(getEffectiveColumnType(column))
      ? [
          {
            meaning: UiIconMeaning.Chart,
            onClick: () => {
              chartingColumnName.value = column.name;
            },
            title: "Chart",
          },
        ]
      : []),
    {
      meaning: column.isHidden ? UiIconMeaning.Show : UiIconMeaning.Hide,
      onClick: async () => {
        await toggleColumnVisibility(column.id);
      },
      title: getToggleColumnVisibilityDescription(column.name, column.isHidden),
    },
    {
      meaning: UiIconMeaning.Edit,
      onClick: () => {
        editingColumnName.value = column.name;
      },
      title: getEditColumnDescription(column.name),
    },
    {
      isDanger: true,
      isGroupStart: true,
      meaning: UiIconMeaning.Delete,
      onClick: () => {
        deletingColumnIds.value = [column.id];
      },
      title: getDeleteColumnDescription(column.name),
    },
  ];
  return { getColumnActionItems };
};
