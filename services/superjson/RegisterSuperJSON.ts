import SuperJSON from "superjson";
import type { Constructor } from "type-fest";

export const RegisterSuperJSON = (klass: Constructor<NonNullable<unknown>>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
