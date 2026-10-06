import type { ResourceLinkInResource } from "@esposter/db-schema";

export type ResourceLinkTarget = Pick<ResourceLinkInResource, "targetId" | "type">;
