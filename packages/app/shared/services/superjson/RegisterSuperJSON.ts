import type { Constructor } from "type-fest";

import SuperJSON from "superjson";

export const RegisterSuperJSON = (klass: Constructor<NonNullable<unknown>>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
