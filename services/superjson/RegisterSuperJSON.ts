import { type Constructor } from "@/util/types/Constructor";
import SuperJSON from "superjson";

export const RegisterSuperJSON = (klass: Constructor<any>) => {
  SuperJSON.registerClass(klass);
  return klass;
};
