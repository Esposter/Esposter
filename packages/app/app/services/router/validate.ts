import type { RouteLocationNormalized } from "vue-router";

import { checkIsUuidV4 } from "@esposter/shared";

export const validate = (route: RouteLocationNormalized) => {
  const id = route.params.id;
  return typeof id === "string" && checkIsUuidV4(id);
};
