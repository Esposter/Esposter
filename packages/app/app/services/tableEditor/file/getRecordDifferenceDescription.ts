import { dayjs } from "#shared/services/dayjs";
import { ItemMetadata } from "@esposter/shared";

const itemMetadataKeys = Object.keys(new ItemMetadata());

export const getRecordDifferenceDescription = (original: object, updated: object): string => {
  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
  const rows: string[] = [];
  for (const key of keys) {
    if (itemMetadataKeys.includes(key)) continue;
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (updated as Record<string, unknown>)[key];
    if (originalValue !== updatedValue) {
      const formattedOriginalValue =
        originalValue instanceof Date ? dayjs(originalValue).format("YYYY-MM-DD") : String(originalValue);
      const formattedUpdatedValue =
        updatedValue instanceof Date ? dayjs(updatedValue).format("YYYY-MM-DD") : String(updatedValue);
      rows.push(`${key} | ${formattedOriginalValue} | ${formattedUpdatedValue}`);
    }
  }
  if (rows.length === 0) return "";
  return ["key | original | updated", ":---: | :---: | :---:", ...rows].join("\n");
};
