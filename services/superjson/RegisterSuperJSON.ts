import SuperJSON from "superjson";
import type { Constructor } from "type-fest";

export const RegisterSuperJSON = (klass: Constructor<any>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
