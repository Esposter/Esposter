import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const useColumnNameRule = (columns: MaybeRefOrGetter<DataSource["columns"]>, currentName?: string) =>
  computed(() => {
    const columnsValue = toValue(columns);
    return (value: string): string | true => {
      if (value !== currentName && columnsValue.some(({ name }) => name === value)) return "Column already exists";
      return true;
    };
  });
