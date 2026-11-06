import { DEV_RECORD_FIELD_SEPARATOR_REGEX } from "#src/services/dev/constants";

// Reads one key's value from a record a line answers as `key=value` fields, or undefined when it holds no such key
export const readScriptedField = (record: string, field: string): string | undefined => {
  const prefix = `${field}=`;
  const fieldText = record.split(DEV_RECORD_FIELD_SEPARATOR_REGEX).find((part) => part.startsWith(prefix));
  return fieldText?.slice(prefix.length);
};
