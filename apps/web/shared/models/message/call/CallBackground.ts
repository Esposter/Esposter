// One of a user's uploaded call backgrounds as the picker renders it: the slot that names its blob, plus a
// Presigned read urls for the image. The url is signed with the listing rather than per render, because the set is capped
// And the picker shows all of it at once
export interface CallBackground {
  presignedUrl: string;
  slot: number;
}
