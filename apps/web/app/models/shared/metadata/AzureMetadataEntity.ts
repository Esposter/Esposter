import type { MessageMetadataEntityMap } from "@/models/db/message/metadata/MessageMetadataEntityMap";
import type { MessageMetadataType } from "@esposter/db-schema";

export type AzureMetadataEntity<TType extends string> = TType extends MessageMetadataType
  ? MessageMetadataEntityMap[TType]
  : never;
