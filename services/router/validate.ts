import { uuidValidateV4 } from "@/util/uuid/uuidValidateV4";
import { type RouteLocationNormalized } from "vue-router";

export const validate = (route: RouteLocationNormalized) => {
  const id = route.params.id;
  return typeof id === "string" && uuidValidateV4(id);
};
