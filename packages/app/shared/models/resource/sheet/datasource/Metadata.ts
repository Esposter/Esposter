import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { datasetProviderTypeSchema } from "#shared/models/dataset/DatasetProviderType";
import { dataSourceTypeSchema } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { z } from "zod";

export interface Metadata {
  dataSourceType: DatasetProviderType | DataSourceType;
  importedAt: Date;
  name: string;
  size: number;
}

export const metadataSchema = z.object({
  dataSourceType: z.union([dataSourceTypeSchema, datasetProviderTypeSchema]),
  importedAt: z.date(),
  name: z.string(),
  size: z.int().nonnegative(),
}) satisfies z.ZodType<Metadata>;
