import type { FileEntity, FileSasEntity, Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

export interface ResourceMutations {
  deleteFile?: (input: { blobPath: string; id: string }) => Promise<void>;
  deleteResource: (input: { id: string }) => Promise<Resource>;
  // `size` is what the storage quota reserves against before a write target is minted — the client's own
  // Declaration, which the settle sweep later replaces with the stored object's real size
  generateUploadFileSasEntities?: (input: {
    files: Pick<FileEntity, "filename" | "mimetype" | "size">[];
    id: string;
  }) => Promise<FileSasEntity[]>;
  publishResource?: (input: { id: string }) => Promise<ResourcePublication>;
  readResourceContent: (input: { id: string }) => Promise<unknown>;
  readResourcePublication?: (input: { id: string }) => Promise<ResourcePublication | undefined>;
  // Rides the publishable capability — a type with no public URL has no views to count
  readResourceViewCount?: (input: { id: string }) => Promise<number>;
  saveResourceContent: (input: { content: unknown; contentVersion: number; id: string }) => Promise<Resource>;
  unpublishResource?: (input: { id: string }) => Promise<Resource>;
  // Tags replace the whole record rather than merging, which is Azure's own tag update semantics
  updateResource: (input: { id: string; name: string; tags?: ResourceTags }) => Promise<Resource>;
}
