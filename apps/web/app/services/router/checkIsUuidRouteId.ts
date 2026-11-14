import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidV7 } from "#shared/util/id/uuid/checkIsUuidV7";
import { getRouteParam } from "@/util/router/getRouteParam";

export const checkIsUuidRouteId = (route: RouteLocationNormalized) => {
  const id = getRouteParam(route.params, "id");
  return checkIsUuidV7(id);
};
