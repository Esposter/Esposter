import { toRawDeep } from "@/util/reactivity/toRawDeep";

export abstract class Serializable {
  getObjectKeys(): PropertyKey[] {
    return [];
  }

  toJSON() {
    return JSON.stringify(structuredClone(toRawDeep(this)));
  }
}
