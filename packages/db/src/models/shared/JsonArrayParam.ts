import { entityKind, Param } from "drizzle-orm";

// The one parameter `inJsonArray` binds a list as: its values as a JSON array. It is a parameter of its own kind, so
// The read set walker finds the list by its kind and reads the values it holds, rather than matching the text around
// The parameter
export class JsonArrayParam extends Param<string> {
  static override readonly [entityKind] = "JsonArrayParam";

  readonly values: readonly string[];

  constructor(values: readonly string[]) {
    super(JSON.stringify(values));
    this.values = values;
  }
}
