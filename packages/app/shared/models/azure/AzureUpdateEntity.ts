import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { CompositeKey } from "#shared/models/azure/CompositeKey";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
