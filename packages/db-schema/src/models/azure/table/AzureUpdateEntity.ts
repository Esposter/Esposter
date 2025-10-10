import type { AzureEntity } from "@/models/azure/table/AzureEntity";
import type { CompositeKey } from "@/models/azure/table/CompositeKey";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
