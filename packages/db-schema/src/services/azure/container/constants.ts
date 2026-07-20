import { AzureContainer } from "@/models/azure/container/AzureContainer";

export const DEAD_LETTER_ARCHIVED_PREFIX = "archived/";
// Storage's BlobCreated subject shape; the replay subscription filters on it and the replay handler
// Strips it back off to recover the blob name.
export const DEAD_LETTER_BLOB_SUBJECT_PREFIX = `/blobServices/default/containers/${AzureContainer.DeadLetter}/blobs/`;
export const DEAD_LETTER_QUARANTINE_PREFIX = "quarantine/";
export const FILENAME_MAX_LENGTH = 1000;
export const FILE_MAX_LENGTH = 10;
