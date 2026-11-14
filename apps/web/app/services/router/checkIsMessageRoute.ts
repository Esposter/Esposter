import type { RouteLocationNormalized } from "vue-router";

import { checkIsMessageId } from "@/services/message/checkIsMessageId";
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getRouteParam } from "@/util/router/getRouteParam";

export const checkIsMessageRoute = (route: RouteLocationNormalized) => {
  const messageId = getRouteParam(route.params, "messageId");
  return checkIsUuidRouteId(route) && checkIsMessageId(messageId);
};
