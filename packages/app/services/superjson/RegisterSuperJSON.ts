import SuperJSON from "superjson";
import type { Constructor } from "type-fest";

export const RegisterSuperJSON = <T extends Constructor<unknown>>(klass: T, _context: ClassDecoratorContext) => {
  SuperJSON.registerClass(klass);
  return klass;
};
