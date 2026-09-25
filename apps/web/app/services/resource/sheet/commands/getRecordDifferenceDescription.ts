import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { formatDate } from "#shared/util/date/formatDate";
import { RECORD_DIFFERENCE_HEADER } from "@/services/resource/sheet/commands/constants";
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

    const formattedOriginalValue =
      originalValue instanceof Date ? formatDate(originalValue, ISO_DATE_FORMAT) : String(originalValue);
    const formattedUpdatedValue =
      updatedValue instanceof Date ? formatDate(updatedValue, ISO_DATE_FORMAT) : String(updatedValue);
    rows.push(`${key} | ${formattedOriginalValue} | ${formattedUpdatedValue}`);
  }
  if (rows.length === 0) return "";
  else return [RECORD_DIFFERENCE_HEADER, ...rows].join("\n");
};
