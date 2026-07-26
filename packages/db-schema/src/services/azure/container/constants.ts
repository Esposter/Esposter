import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { dayjs } from "@/services/dayjs";

export const DEAD_LETTER_ARCHIVED_PREFIX = "archived/";
// Storage's BlobCreated subject shape; the replay subscription filters on it and the replay handler
// Strips it back off to recover the blob name.
export const DEAD_LETTER_BLOB_SUBJECT_PREFIX = `/blobServices/default/containers/${AzureContainer.DeadLetter}/blobs/`;
export const DEAD_LETTER_QUARANTINE_PREFIX = "quarantine/";
export const FILENAME_MAX_LENGTH = 1000;
export const FILE_MAX_LENGTH = 10;
// How long a read SAS stays valid. Clients cache the urls they were handed, so they also re-mint on this.
export const READ_SAS_DURATION_MS = dayjs.duration(1, "day").asMilliseconds();
// How long a write SAS stays valid. Also the age a blob must reach before a prefix sweep may treat it as an
// Orphan: anything younger could still belong to an upload whose owning row write has not landed yet.
export const WRITE_SAS_DURATION_MS = dayjs.duration(1, "hour").asMilliseconds();
