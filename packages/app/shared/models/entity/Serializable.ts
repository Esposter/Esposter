import { toRawDeep } from "#shared/util/reactivity/toRawDeep";

export abstract class Serializable {
  toJSON() {
    return JSON.stringify(structuredClone(toRawDeep(this)));
  }
}
