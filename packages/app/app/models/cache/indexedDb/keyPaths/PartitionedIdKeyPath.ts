import { AItemEntityPropertyNames } from "#shared/models/entity/AItemEntity";
import { CompositeKeyPropertyNames } from "@esposter/azure";

export const PartitionedIdKeyPath = [CompositeKeyPropertyNames.partitionKey, AItemEntityPropertyNames.id];
