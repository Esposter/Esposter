import { RESOURCE_COLUMN_WIDTH_SEPARATOR } from "@/services/resource/list/constants";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { MAX_DATA_TABLE_COLUMN_WIDTH, MIN_DATA_TABLE_COLUMN_WIDTH } from "@/services/ui/constants";

// An entry naming no column of the list, or a width no handle could have dragged to, is dropped rather than failing the
// Whole deep link
export const deserializeResourceColumnKeyWidthMap = (value: string) =>
  Object.fromEntries(
    value.split(",").flatMap((entry) => {
      const [key, widthValue] = entry.split(RESOURCE_COLUMN_WIDTH_SEPARATOR);
      const width = Number(widthValue);
      return ResourceHeaders.some((header) => header.key === key) &&
        Number.isInteger(width) &&
        width >= MIN_DATA_TABLE_COLUMN_WIDTH &&
        width <= MAX_DATA_TABLE_COLUMN_WIDTH
        ? [[key, width]]
        : [];
    }),
  );
