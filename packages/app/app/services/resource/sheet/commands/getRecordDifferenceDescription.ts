import { dayjs } from "#shared/services/dayjs";
import { ISO_DATE_FORMAT } from "#shared/services/dayjs/constants";
import { ItemMetadata } from "@esposter/shared";

const itemMetadataKeySet = new Set(Object.keys(new ItemMetadata()));

export const getRecordDifferenceDescription = (original: object, updated: object): string => {
  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  const rows: string[] = [];
  for (const key of keys) {
    if (itemMetadataKeySet.has(key)) continue;
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (updated as Record<string, unknown>)[key];
    if (originalValue !== updatedValue) {
      const formattedOriginalValue =
        originalValue instanceof Date ? dayjs(originalValue).format(ISO_DATE_FORMAT) : String(originalValue);
      const formattedUpdatedValue =
        updatedValue instanceof Date ? dayjs(updatedValue).format(ISO_DATE_FORMAT) : String(updatedValue);
      rows.push(`${key} | ${formattedOriginalValue} | ${formattedUpdatedValue}`);
    }
  }
  if (rows.length === 0) return "";
  return ["key | original | updated", ":---: | :---: | :---:", ...rows].join("\n");
};
