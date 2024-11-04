import type { Logger } from "drizzle-orm/logger";

import dedent from "dedent";
import { highlight } from "sql-highlight";

export class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]) {
    console.log(
      highlight(dedent`Query:
    ${query}

    ${
      params.length > 0
        ? `Parameters:
    ${params.map((p, i) => `$${i + 1} = ${p}`)}`
        : ""
    }`),
    );
  }
}
