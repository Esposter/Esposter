import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";
import { getRouteParam } from "@/util/router/getRouteParam";

export const checkIsUuidRouteId = (route: RouteLocationNormalized) => {
  const id = getRouteParam(route.params, "id");
  return checkIsUuidV4(id);
};
