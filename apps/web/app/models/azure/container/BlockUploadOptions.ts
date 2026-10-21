// A create-only upload is refused by Blob Storage when the blob already exists, so its bytes are never overwritten
export interface BlockUploadOptions {
  isCreateOnly?: boolean;
}
