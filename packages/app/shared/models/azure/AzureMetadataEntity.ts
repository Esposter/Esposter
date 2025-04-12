import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { type } from "arktype";
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class AzureMetadataEntity<TType extends string> extends AzureEntity {
  type!: TType;
}

export const createAzureMetadataEntitySchema = <TType extends string>(
  schema: type.Any<ToData<CompositeKeyEntity>>,
  typeSchema: type.Any<TType>,
) => createAzureEntitySchema(type({ "...": schema, type: typeSchema }));
