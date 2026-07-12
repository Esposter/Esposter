import type { Resource } from "@esposter/db-schema";

export interface RecentResourceView extends Pick<Resource, "id" | "name" | "type"> {}
