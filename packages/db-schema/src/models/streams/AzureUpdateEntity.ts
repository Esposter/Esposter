import type { AzureEntity } from "#src/models/streams/AzureEntity";
import type { CompositeKey } from "#src/models/streams/CompositeKey";

export type AzureUpdateEntity<TEntity extends AzureEntity> = CompositeKey & Partial<TEntity>;
