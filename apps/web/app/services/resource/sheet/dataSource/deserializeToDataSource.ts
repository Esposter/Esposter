import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";

import { buildDataset } from "#src/services/resource/sheet/dataSource/buildDataset";
import { datasetToDataSource } from "#src/services/resource/sheet/dataSource/datasetToDataSource";

export const deserializeToDataSource = (
  sourceNames: string[],
  bodyRows: string[][],
  dataSourceType: Metadata["dataSourceType"],
  file: Pick<File, "name" | "size">,
) => datasetToDataSource(buildDataset(sourceNames, bodyRows), dataSourceType, file.name, file.size);
