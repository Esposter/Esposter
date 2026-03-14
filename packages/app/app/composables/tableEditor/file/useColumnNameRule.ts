import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { ValidationRule } from "vuetify";

export const useColumnNameRule = (columns: MaybeRefOrGetter<DataSource["columns"]>, currentName?: string): ComputedRef<ValidationRule> =>
  computed<ValidationRule>(() => {
    const columnsValue = toValue(columns);
    return (value: string) => {
      if (value !== currentName && columnsValue.some(({ name }) => name === value)) return "Column already exists";
      return true;
    };
  });
