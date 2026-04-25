import { AItemEntityPropertyNames } from "#shared/models/entity/AItemEntity";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const PartitionedIdKeyPath = [CompositeKeyPropertyNames.partitionKey, AItemEntityPropertyNames.id];
