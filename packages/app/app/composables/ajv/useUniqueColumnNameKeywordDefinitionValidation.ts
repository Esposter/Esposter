import type { SchemaValidateFunction } from "ajv";
import type { MaybeRefOrGetter } from "vue";

export const useUniqueColumnNameKeywordDefinitionValidation = (
  columnNames: MaybeRefOrGetter<string[]>,
  currentName: MaybeRefOrGetter<string>,
): SchemaValidateFunction =>
  function (_schema: boolean, data: string) {
    const columnNamesValue = toValue(columnNames);
    const currentNameValue = toValue(currentName);
    return data === currentNameValue || !columnNamesValue.includes(data);
  };
