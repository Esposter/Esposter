import SuperJSON from "superjson";
import { Constructor } from "type-fest";

export const RegisterSuperJSON = (klass: Constructor<any>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
