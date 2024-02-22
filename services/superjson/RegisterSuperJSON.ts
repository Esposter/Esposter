import type { Constructor } from "@/util/types/Constructor";
import SuperJSON from "superjson";

export const RegisterSuperJSON = (klass: Constructor<NonNullable<unknown>>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
