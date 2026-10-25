import type { ItemEntityType } from "@esposter/shared";

import { AzureEntity } from "#src/models/azure/table/AzureEntity";

export abstract class AzureMetadataEntity<T extends string> extends AzureEntity implements ItemEntityType<T> {
  declare type: T;
}
