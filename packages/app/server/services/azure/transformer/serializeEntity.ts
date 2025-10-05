import type { AzureEntity } from "#shared/models/azure/table/AzureEntity";
import type { AzureUpdateEntity } from "#shared/models/azure/table/AzureUpdateEntity";
import type { TableEntity } from "@azure/data-tables";

import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const serializeEntity = (entity: AzureUpdateEntity<AzureEntity>) =>
  Object.fromEntries(
    Object.entries(entity).map(([property, value]) => {
      if (value && getIsSerializable(value)) return [property, JSON.stringify(value)];
      else return [property, value];
    }),
  ) as TableEntity;
