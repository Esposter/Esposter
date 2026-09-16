import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";

export const checkIsUuidRouteId = (route: RouteLocationNormalized) => {
  const id = route.params.id;
  return typeof id === "string" && checkIsUuidV4(id);
};
