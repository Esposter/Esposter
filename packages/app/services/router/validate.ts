import type { RouteLocationNormalized } from "vue-router";

import { uuidValidateV4 } from "@/util/id/uuid/uuidValidateV4";

export const validate = (route: RouteLocationNormalized) => {
  const id = route.params.id;
  return typeof id === "string" && uuidValidateV4(id);
};
