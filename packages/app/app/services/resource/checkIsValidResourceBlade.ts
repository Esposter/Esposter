import type { ResourceType } from "@esposter/db-schema";

import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
// Routable iff the nav offers it — one source, so the nav can never link a blade the route guard 404s
export const checkIsValidResourceBlade = (type: ResourceType, blade: string) =>
  getResourceBladeDefinitions(type).some(({ slug }) => slug === blade);
