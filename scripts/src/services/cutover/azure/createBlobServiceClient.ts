import { BlobServiceClient } from "@azure/storage-blob";

// The connection string is read from the environment by the caller and given here once; nothing else holds it
export const createBlobServiceClient = (connectionString: string): BlobServiceClient =>
  BlobServiceClient.fromConnectionString(connectionString);
