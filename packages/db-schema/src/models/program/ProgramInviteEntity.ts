import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { selectResourceSchema } from "@/schema/resources";
import { z } from "zod";

// PartitionKey = program id, rowKey = the key value's hash — the recipient's identity, so storage itself
// Rejects a second invite for a recipient who already has one. A random rowKey would make every racing
// Generate a distinct row, and nothing below the storage layer can enforce uniqueness after the fact
export class ProgramInviteEntity extends AzureEntity {
  // The audience key column's value for this recipient — never leaves the server or the owner client
  keyValue = "";
  // A non-secret stand-in for the recipient, safe to publish. The token is the bearer credential
  // Survey writes accept, so it can never be the identity a publishable dataset carries — a published
  // Funnel chart would otherwise hand every viewer the ability to respond as any invitee
  publicId = "";
  // A UUID, never derived from the key value — a derivable token would let anyone mint one from an email
  // Address. That unguessability is why it cannot double as the rowKey: a key the caller cannot predict
  // Is a key storage cannot deduplicate on
  token = "";

  constructor(init?: Partial<ProgramInviteEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const programInviteEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectResourceSchema.shape.id,
      rowKey: z.hash("sha256"),
    }),
  ).shape,
  keyValue: z.string().min(1),
  publicId: z.uuid(),
  token: z.uuid(),
}) satisfies z.ZodType<ToData<ProgramInviteEntity>>;
