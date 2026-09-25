import { RESOURCE_COLUMN_WIDTH_SEPARATOR } from "@/services/resource/list/constants";

export const serializeResourceColumnKeyWidthMap = (columnKeyWidthMap: Record<string, number>) =>
  Object.entries(columnKeyWidthMap)
    .map(([key, width]) => `${key}${RESOURCE_COLUMN_WIDTH_SEPARATOR}${width}`)
    .join(",");
