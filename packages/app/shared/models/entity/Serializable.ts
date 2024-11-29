import { toDeepRaw } from "@/util/reactivity/toDeepRaw";

export class Serializable {
  toJSON() {
    return JSON.stringify(structuredClone(toDeepRaw(this)));
  }
}
