import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

// A Lua table: assigning nil removes its key, as Lua does
export class LuaTable {
  get entries(): ReadonlyMap<LuaValue, LuaValue> {
    return this.#entries;
  }

  readonly #entries = new Map<LuaValue, LuaValue>();

  get(key: LuaValue): LuaValue {
    return this.#entries.get(key);
  }

  set(key: LuaValue, value: LuaValue): void {
    if (value === undefined) this.#entries.delete(key);
    else this.#entries.set(key, value);
  }
}
