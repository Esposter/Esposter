import type { AzureEntity } from "#shared/models/azure/table/AzureEntity";
import type { AItemEntity } from "#shared/models/entity/AItemEntity";

export type AEntity = AItemEntity | AzureEntity;
