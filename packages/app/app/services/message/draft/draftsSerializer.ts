import type { Draft } from "@/models/message/Draft";
import type { Serializer } from "@vueuse/core";

import { draftSchema } from "@/models/message/Draft";
import { getResult } from "@esposter/shared";
import { z } from "zod";

const draftsSchema = z.record(z.string(), draftSchema);

// The Map the store reads is the storage: this is what makes it one rather than a copy kept beside it, and it
// Is why no draft write touches localStorage itself. A blob that no longer parses is dropped whole — a
// Half-restored draft list is worse than an empty one, and every composer still holds its own text
export const draftsSerializer: Serializer<Map<string, Draft>> = {
  read: (raw) =>
    getResult(
      () =>
        // eslint-disable-next-line no-restricted-syntax -- draftSchema coerces updatedAt itself, so a draft body that is an ISO datetime stays a string
        new Map(Object.entries(draftsSchema.parse(JSON.parse(raw)))),
    )
      .orTee(console.error)
      .unwrapOr(new Map()),
  write: (drafts) => JSON.stringify(Object.fromEntries(drafts)),
};
