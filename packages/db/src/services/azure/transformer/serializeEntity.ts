import type { TableEntity } from "@azure/data-tables";
import type { AzureEntity, AzureUpdateEntity } from "@esposter/db-schema";

import { checkIsSerializable } from "#src/services/azure/transformer/checkIsSerializable";

export const serializeEntity = (entity: AzureUpdateEntity<AzureEntity>) =>
  Object.fromEntries(
    Object.entries(entity).map(([property, value]) => {
      if (value && checkIsSerializable(value)) return [property, JSON.stringify(value)];
      else return [property, value];
    }),
  ) as TableEntity;
