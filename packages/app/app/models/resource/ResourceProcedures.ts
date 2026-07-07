import type { Resource } from "@esposter/db-schema";

export interface ResourceProcedures<TContent> {
  createResource: (input: { name: string }) => Promise<Resource>;
  deleteResource: (input: { id: string }) => Promise<Resource>;
  // Publish procedures exist only for publishable resource types (ResourceDefinitionMap capabilities)
  publishResource?: (input: { id: string }) => Promise<Resource>;
  // The content comes back as serialized plain data, so the caller rehydrates it through its content class
  readResourceContent: (input: { id: string }) => Promise<unknown>;
  readResources: () => Promise<Resource[]>;
  saveResourceContent: (input: { content: TContent; contentVersion: number; id: string }) => Promise<Resource>;
  unpublishResource?: (input: { id: string }) => Promise<Resource>;
  updateResource: (input: { id: string; name: string }) => Promise<Resource>;
}
