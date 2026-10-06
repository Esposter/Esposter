import type { ResourceInResource } from "@esposter/db-schema";

// Another resource as a row linking to it shows it: its name and its kind
export type LinkedResource = Pick<ResourceInResource, "id" | "name" | "type">;
