export interface UploadFileToUrlOptions {
  // A create-only upload is refused when the object is already stored, so its bytes are never overwritten
  isCreateOnly?: boolean;
  onProgress?: (progress: number) => void;
}
