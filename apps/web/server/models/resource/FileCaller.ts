import type { DeleteFileInput } from "#shared/models/db/resource/DeleteFileInput";
import type { GenerateUploadFilePresignedUrlEntitiesInput } from "#shared/models/db/resource/GenerateUploadFilePresignedUrlEntitiesInput";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";

// The file procedures each type with file assets generates, called the same way
export interface FileCaller {
  deleteFile: (input: DeleteFileInput) => Promise<void>;
  generateUploadFilePresignedUrlEntities: (
    input: GenerateUploadFilePresignedUrlEntitiesInput,
  ) => Promise<ResourceFilePresignedUrlEntity[]>;
}
