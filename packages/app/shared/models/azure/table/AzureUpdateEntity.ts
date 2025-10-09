import type { AzureEntity, CompositeKey } from "@esposter/shared";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
