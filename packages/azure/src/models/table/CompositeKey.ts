import type { TableEntity } from "@azure/data-tables";
import type { PropertyNames } from "@esposter/shared";
import type { OmitIndexSignature } from "type-fest";

import { getPropertyNames } from "@esposter/shared";

export class CompositeKey implements OmitIndexSignature<TableEntity> {
  declare partitionKey: string;
  declare rowKey: string;
}

export const CompositeKeyPropertyNames: PropertyNames<CompositeKey> = getPropertyNames<CompositeKey>();
