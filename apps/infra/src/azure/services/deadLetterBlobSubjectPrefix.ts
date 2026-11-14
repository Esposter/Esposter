import { AzureContainer } from "#src/azure/models/AzureContainer";
import { getBlobSubjectPrefix } from "#src/azure/services/getBlobSubjectPrefix";

export const DEAD_LETTER_BLOB_SUBJECT_PREFIX: string = getBlobSubjectPrefix(AzureContainer.DeadLetter);
