import type { RouteLocationNormalized } from "vue-router";

import { checkIsMessageId } from "#src/services/message/checkIsMessageId";
import { checkIsUuidRouteId } from "#src/services/router/checkIsUuidRouteId";
import { getRouteParam } from "#src/util/router/getRouteParam";

export const checkIsMessageRoute = (route: RouteLocationNormalized) => {
  const messageId = getRouteParam(route.params, "messageId");
  return checkIsUuidRouteId(route) && checkIsMessageId(messageId);
};
