import { toRawDeep } from "#src/util/reactivity/toRawDeep";

export abstract class Serializable {
  toJSON(): this {
    return structuredClone(toRawDeep(this));
  }
}
