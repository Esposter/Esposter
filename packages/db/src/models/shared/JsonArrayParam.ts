import { entityKind, Param } from "drizzle-orm";

// The one parameter `inJsonArray` binds a list as: its values as a JSON array. It is a parameter of its own kind, so the read
// Set walker finds the list by its kind and reads the values it holds, rather than matching the text around the parameter
export class JsonArrayParam extends Param<string> {
  static override readonly [entityKind] = "JsonArrayParam";

  readonly values: readonly string[];

  constructor(values: readonly string[]) {
    super(JSON.stringify(values));
    this.values = values;
  }
}
