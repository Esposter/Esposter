import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getRouteParam } from "@/util/router/getRouteParam";
import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";

export const checkIsMessageRoute = (route: RouteLocationNormalized) => {
  const messageId = getRouteParam(route.params, "messageId");
  return checkIsUuidRouteId(route) && checkIsUuidV4(messageId);
};
