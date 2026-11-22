import { transformer } from "#shared/services/trpc/transformer";
import { getUtf8ByteLength } from "@esposter/shared";

// The bytes a procedure input puts on the wire, which is the transformer's envelope rather than the input's own
// JSON: a registered class serializes as an escaped JSON string with an entry of its own in the metadata, so a
// Sheet's rows cost far more than their JSON. This is what the server's request size limiter measures
export const getRequestBodyByteLength = (input: unknown) =>
  getUtf8ByteLength(JSON.stringify(transformer.serialize(input)));
