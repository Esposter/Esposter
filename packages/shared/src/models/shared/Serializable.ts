import { toRawDeep } from "@/util/reactivity/toRawDeep";

export abstract class Serializable {
  toJSON(): this {
    return structuredClone(toRawDeep(this));
  }
}
