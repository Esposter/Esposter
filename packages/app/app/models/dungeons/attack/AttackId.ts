import type { Type } from "arktype";

import { type } from "arktype";

export enum AttackId {
  "Ice Shard" = "Ice Shard",
  Slash = "Slash",
}

export const attackIdSchema = type.valueOf(AttackId) satisfies Type<AttackId>;
