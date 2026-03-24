import type { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnTransformationSchemaMap } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne } from "@esposter/shared";

export const useColumnTransformationJsonSchema = (
  transformationType: MaybeRefOrGetter<ColumnTransformationType>,
  dataSource: MaybeRefOrGetter<DataSource>,
) => {
  const jsonSchema = computed(() =>
    zodToJsonSchema(takeOne(ColumnTransformationSchemaMap, toValue(transformationType))),
  );
  const options = computed(() => ({
    context: {
      sourceColumnItems: toValue(dataSource).columns.map(({ id, name }) => ({ title: name, value: id })),
    },
  }));
  return { jsonSchema, options };
};
