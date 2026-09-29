import type { Dataset } from "#shared/models/dataset/Dataset";
import type { Context } from "@@/server/trpc/context";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

export interface DatasetProvider {
  // Handed a resource the caller already owns, since `readDataset` resolves ownership before any provider runs
  read: (db: Context["db"], resource: ResourceInResource) => Promise<Dataset>;
  // The type a reference to this provider must name, which is what that ownership check is made against
  resourceType: ResourceType;
}
