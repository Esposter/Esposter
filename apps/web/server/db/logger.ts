import type { Logger } from "drizzle-orm/logger";

import { dedent } from "@esposter/shared";

export class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]) {
    console.log(dedent`Query:
    ${query}

    ${
      params.length > 0
        ? `Parameters:
    ${params.map((parameter, index) => `$${index + 1} = ${String(parameter)}`).join(", ")}`
        : ""
    }`);
  }
}
