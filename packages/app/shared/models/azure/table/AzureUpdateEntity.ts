import type { AzureEntity } from "#shared/models/azure/table/AzureEntity";
import type { CompositeKey } from "@esposter/shared";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
