import type { Constructor } from "type-fest";

import SuperJSON from "superjson";

export const RegisterSuperJSON = <T extends Constructor<unknown>>(klass: T, _context: ClassDecoratorContext) => {
  SuperJSON.registerClass(klass);
  return klass;
};
