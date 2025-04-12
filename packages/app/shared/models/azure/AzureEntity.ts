import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type, type } from "arktype";

import { CompositeKeyEntity, createCompositeKeyEntitySchema } from "#shared/models/azure/CompositeKeyEntity";
import { applyItemMetadataMixin, itemMetadataSchema } from "#shared/models/entity/ItemMetadata";

export const AzureEntity = applyItemMetadataMixin(CompositeKeyEntity);
export type AzureEntity = typeof AzureEntity.prototype;

export const createAzureEntitySchema = <TEntity extends ToData<CompositeKeyEntity>>(schema: type.Any<TEntity>) =>
  createCompositeKeyEntitySchema(schema).as<object>().merge(itemMetadataSchema) as unknown as Type<
    ItemMetadata & TEntity
  >;
