import type { CompositeKey } from "#src/models/streams/CompositeKey";

import { Serializable } from "@esposter/shared";

export class CompositeKeyEntity extends Serializable implements CompositeKey {
  declare partitionKey: string;
  declare rowKey: string;
}
