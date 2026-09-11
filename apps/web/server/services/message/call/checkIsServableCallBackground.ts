import type { CallBackgroundBlob } from "@@/server/models/message/call/CallBackgroundBlob";

import { MAX_CALL_BACKGROUND_SIZE_BYTES } from "#shared/services/message/constants";

// A write SAS constrains the blob name it may be PUT to, never the bytes that arrive through it, so the size
// The picker checked before asking for a target is an early no rather than the guarantee. This is the
// Guarantee, and it costs nothing extra: the length comes back on the listing that renders the picker anyway.
// The stored content type is deliberately not read here: the same client sets it on the same upload, so it
// Is the mime claim again rather than evidence about the bytes - the write target's check already has that
export const checkIsServableCallBackground = ({ contentLength }: CallBackgroundBlob): boolean =>
  contentLength <= MAX_CALL_BACKGROUND_SIZE_BYTES;
