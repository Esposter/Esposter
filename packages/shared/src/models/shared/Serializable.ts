import { toRawDeep } from "@/util/reactivity/toRawDeep";

export abstract class Serializable {
  toJSON(): string {
    return JSON.stringify(structuredClone(toRawDeep(this)));
  }
}
