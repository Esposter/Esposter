import type { TypeDocOptions } from "typedoc";

export const externalSymbolLinkMappings: TypeDocOptions["externalSymbolLinkMappings"] = {
  "@azure/storage-blob": {
    AppendBlobClient: "#",
    BlobClient: "#",
    BlobLeaseClient: "#",
    BlobServiceClient: "#",
    BlockBlobClient: "#",
    "BlockBlobClient.commitBlockList": "#",
    "BlockBlobClient.stageBlock": "#",
    "BlockBlobClient.uploadBrowserData": "#",
    "BlockBlobClient.uploadFile": "#",
    "BlockBlobClient.uploadStream": "#",
    "BlockBlobParallelUploadOptions.blobHTTPHeaders": "#",
    "BlockBlobParallelUploadOptions.maxSingleShotSize": "#",
    ContainerClient: "#",
    PageBlobClient: "#",
  },
};
