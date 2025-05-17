import type { TableEntity } from "@azure/data-tables";

import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const serializeEntity = (entity: TableEntity) =>
  Object.fromEntries(
    Object.entries(entity).map(([property, value]) => {
      if (getIsSerializable(value)) return [property, JSON.stringify(value)];
      else return [property, value];
    }),
  ) as TableEntity;
