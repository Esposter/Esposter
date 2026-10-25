import { RECORD_DIFFERENCE_HEADER } from "#shared/services/resource/sheet/commands/constants";
import { ItemMetadata } from "@esposter/shared";

const ItemMetadataKeySet = new Set(Object.keys(new ItemMetadata()));

export const getRecordDifferenceDescription = (original: object, next: object) => {
  const keys = new Set([...Object.keys(original), ...Object.keys(next)]);
  const rows: string[] = [];
  for (const key of keys) {
    if (ItemMetadataKeySet.has(key)) continue;
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (next as Record<string, unknown>)[key];
    if (originalValue === updatedValue) continue;

    rows.push(`${key} | ${String(originalValue)} | ${String(updatedValue)}`);
  }
  if (rows.length === 0) return "";
  else return [RECORD_DIFFERENCE_HEADER, ...rows].join("\n");
};
