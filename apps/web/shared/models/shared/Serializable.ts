import { toRawDeep } from "@esposter/shared";

export abstract class Serializable {
  toJSON(): this {
    return structuredClone(toRawDeep(this));
  }
}
