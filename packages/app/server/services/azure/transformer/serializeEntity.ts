import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { TableEntity } from "@azure/data-tables";

export const serializeEntity = (entity: CompositeKey): TableEntity =>
  Object.fromEntries(
    Object.entries(entity).map(([property, value]) => {
      if (Array.isArray(value) || typeof value === "object") return [property, JSON.stringify(value)];
      else return [property, value];
    }),
  );
