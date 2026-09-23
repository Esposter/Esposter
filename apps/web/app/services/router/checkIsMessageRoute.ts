import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { reverseTickedTimestampSchema } from "@esposter/db-schema";

export const checkIsMessageRoute = (route: RouteLocationNormalized) =>
  checkIsUuidRouteId(route) && reverseTickedTimestampSchema.safeParse(route.params.rowKey).success;
