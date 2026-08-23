import type { AzureEntity } from "@/models/azure/table/AzureEntity";
import type { CompositeKey } from "@esposter/azure";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
