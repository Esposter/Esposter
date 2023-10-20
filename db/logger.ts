import dedent from "dedent";
import type { Logger } from "drizzle-orm/logger";
import { highlight } from "sql-highlight";

export class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
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
