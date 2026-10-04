import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getRouteParam } from "@/util/router/getRouteParam";
import { reverseTickedTimestampSchema } from "@esposter/db-schema";

export const checkIsMessageRoute = (route: RouteLocationNormalized) => {
  const rowKey = getRouteParam(route.params, "rowKey");
  return checkIsUuidRouteId(route) && reverseTickedTimestampSchema.safeParse(rowKey).success;
};
