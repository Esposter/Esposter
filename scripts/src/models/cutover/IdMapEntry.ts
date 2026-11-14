import { secretTokenSchema } from "@esposter/shared";
import { z } from "zod";

// A bearer token is stored only as its SHA-256 hex, so the copy writes the hash of a fresh token nobody receives: the owners regenerate
// Their links after the cutover. The old token is kept only to find the row it belonged to, so a reference to it is written with the hash
const tokenHashSchema = z.string().regex(/^[0-9a-f]{64}$/u);

// A Postgres row's new id, found by the old UUIDv4 it had. A row that holds a bearer token also carries the hash of the one it was
// Given now, found by the old token
export const oldIdMapEntrySchema = z.object({
  id: z.uuidv7(),
  oldId: z.uuidv4(),
  oldToken: z.string().optional(),
  tokenHash: tokenHashSchema.optional(),
});
export type OldIdMapEntry = z.infer<typeof oldIdMapEntrySchema>;

// An Azure entity's new id, found by its table and its keys: no store held an id for it, so its key is the one it is found by
export const azureIdMapEntrySchema = z.object({
  id: z.uuidv7(),
  oldToken: z.string().optional(),
  partitionKey: z.string(),
  rowKey: z.string(),
  tokenHash: tokenHashSchema.optional(),
});
export type AzureIdMapEntry = z.infer<typeof azureIdMapEntrySchema>;

// An invite's code, which is both its primary key and the credential in its link, found by the code the invite had. An admin reads the
// Code, so the new one is kept in the clear, as a generateSecretToken code
export const inviteCodeEntrySchema = z.object({ code: secretTokenSchema, oldCode: z.string() });
export type InviteCodeEntry = z.infer<typeof inviteCodeEntrySchema>;

// A message's number in its room, found by the room's new id and the message's row key. The number is the message's row id in its room's
// Object, so a re-run and a delta give the message the number it has
export const messageNumberEntrySchema = z.object({
  number: z.int().positive(),
  roomId: z.uuidv7(),
  rowKey: z.string(),
});
export type MessageNumberEntry = z.infer<typeof messageNumberEntrySchema>;
