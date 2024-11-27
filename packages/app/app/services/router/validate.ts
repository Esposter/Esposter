import type { RouteLocationNormalized } from "vue-router";

import { uuidValidateV4 } from "@esposter/shared";

export const validate = (route: RouteLocationNormalized) => {
  const id = route.params.id;
  return typeof id === "string" && uuidValidateV4(id);
};
