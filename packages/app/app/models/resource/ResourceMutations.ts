import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

export interface ResourceMutations {
  deleteResource: (input: { id: string }) => Promise<Resource>;
  publishResource?: (input: { id: string }) => Promise<ResourcePublication>;
  readResourceContent: (input: { id: string }) => Promise<unknown>;
  readResourcePublication?: (input: { id: string }) => Promise<ResourcePublication | undefined>;
  saveResourceContent: (input: { content: unknown; contentVersion: number; id: string }) => Promise<Resource>;
  unpublishResource?: (input: { id: string }) => Promise<Resource>;
  // Tags replace the whole record rather than merging, which is Azure's own tag update semantics
  updateResource: (input: { id: string; name: string; tags?: ResourceTags }) => Promise<Resource>;
}
