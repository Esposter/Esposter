import { toDeepRaw } from "@/util/reactivity/toDeepRaw";

export abstract class Serializable {
  toJSON() {
    return JSON.stringify(structuredClone(toDeepRaw(this)));
  }
}
