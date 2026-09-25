import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { datasetProviderTypeSchema } from "#shared/models/dataset/DatasetProviderType";
import { dataSourceTypeSchema } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export interface Metadata {
  dataSourceType: DatasetProviderType | DataSourceType;
  importedAt: Date;
  name: string;
  size: number;
}

export const metadataSchema = z.object({
  dataSourceType: z.union([dataSourceTypeSchema, datasetProviderTypeSchema]),
  importedAt: z.coerce.date(),
  name: z.string().max(MAX_RESOURCE_CONTENT_LENGTH),
  size: z.int().nonnegative(),
}) satisfies z.ZodType<Metadata>;
