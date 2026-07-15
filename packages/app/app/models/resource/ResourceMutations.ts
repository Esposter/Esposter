import type { FileEntity, FileSasEntity, Resource, ResourcePublication } from "@esposter/db-schema";

export interface ResourceMutations {
  deleteFile?: (input: { blobPath: string; id: string }) => Promise<void>;
  deleteResource: (input: { id: string }) => Promise<Resource>;
  generateDownloadFileSasUrls?: (input: {
    files: Pick<FileEntity, "filename" | "id" | "mimetype">[];
    id: string;
  }) => Promise<string[]>;
  generateUploadFileSasEntities?: (input: {
    files: Pick<FileEntity, "filename" | "mimetype">[];
    id: string;
  }) => Promise<FileSasEntity[]>;
  publishResource?: (input: { id: string }) => Promise<ResourcePublication>;
  readResourceContent: (input: { id: string }) => Promise<unknown>;
  readResourcePublication?: (input: { id: string }) => Promise<ResourcePublication | undefined>;
  saveResourceContent: (input: { content: unknown; contentVersion: number; id: string }) => Promise<Resource>;
  unpublishResource?: (input: { id: string }) => Promise<Resource>;
  updateResource: (input: { id: string; name: string }) => Promise<Resource>;
}
