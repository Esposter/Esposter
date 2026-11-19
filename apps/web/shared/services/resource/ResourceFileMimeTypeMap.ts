import { IMAGE_UPLOAD_MIME_TYPES } from "#shared/services/file/constants";
import { WEBPAGE_VIDEO_MIME_TYPES } from "#shared/services/pageBuilder/constants";
import { ResourceType } from "@esposter/db-schema";

// The files each type's upload takes, which are the files its picker offers, so the one list decides both. A type with no
// File assets takes none. A webpage takes its videos beside its images, since its media field offers both
export const ResourceFileMimeTypeMap = {
  [ResourceType.Blueprint]: [],
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: IMAGE_UPLOAD_MIME_TYPES,
  [ResourceType.Note]: IMAGE_UPLOAD_MIME_TYPES,
  [ResourceType.Program]: [],
  [ResourceType.Sheet]: [],
  [ResourceType.Survey]: IMAGE_UPLOAD_MIME_TYPES,
  [ResourceType.TodoList]: [],
  [ResourceType.Webpage]: [...IMAGE_UPLOAD_MIME_TYPES, ...WEBPAGE_VIDEO_MIME_TYPES],
  [ResourceType.Whiteboard]: IMAGE_UPLOAD_MIME_TYPES,
} as const satisfies Record<ResourceType, readonly string[]>;
