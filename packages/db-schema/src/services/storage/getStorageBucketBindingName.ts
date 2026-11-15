import type { StorageBucket } from "#src/models/storage/StorageBucket";

// A bucket's binding is named by the bucket: `message-assets` is MESSAGE_ASSETS, declared under that name in the Worker's
// Config, so no binding name is spelled out anywhere else
export const getStorageBucketBindingName = (storageBucket: StorageBucket) =>
  storageBucket.replaceAll("-", "_").toUpperCase();
