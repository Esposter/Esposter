import type { Resource } from "@esposter/db-schema";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { formatDate } from "#shared/util/date/formatDate";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { escapeCsvCell } from "@/services/resource/sheet/csv/escapeCsvCell";

const HEADER_TITLES = ["Type", "Name", "Created At", "Updated At"];

export const getResourcesCsv = (resources: Resource[]): string => {
  const headerRow = HEADER_TITLES.map((title) => escapeCsvCell(title, CsvDelimiter.Comma)).join(CsvDelimiter.Comma);
  const dataRows = resources.map(({ createdAt, name, type, updatedAt }) =>
    [
      ResourceDefinitionMap[type].title,
      name,
      formatDate(createdAt, RESOURCE_DATE_FORMAT),
      formatDate(updatedAt, RESOURCE_DATE_FORMAT),
    ]
      .map((cell) => escapeCsvCell(cell, CsvDelimiter.Comma))
      .join(CsvDelimiter.Comma),
  );
  return [headerRow, ...dataRows].join("\n");
};
