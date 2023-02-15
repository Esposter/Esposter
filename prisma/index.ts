import { isProduction } from "@/utils/environment";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { highlight } from "cli-highlight";
import dedent from "dedent";

let prismaClient: PrismaClient;

const highlightSql = (sql: string) =>
  highlight(sql, {
    theme: {
      keyword: chalk.blueBright,
      literal: chalk.blueBright,
      string: chalk.white,
      type: chalk.magentaBright,
      built_in: chalk.magentaBright,
      comment: chalk.gray,
    },
    language: "sql",
  });

if (isProduction) prismaClient = new PrismaClient({ log: ["error"] });
else {
  const devPrismaClient = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },

      {
        emit: "stdout",
        level: "warn",
      },
      {
        emit: "stdout",
        level: "info",
      },
    ],
  });

  devPrismaClient.$on("query", (e) => {
    console.log(
      highlightSql(dedent`Query: ${e.query}
    Parameters: ${e.params}
    Duration: ${e.duration}ms
    Time: ${e.timestamp}
    Target: ${e.target}`)
    );
    console.log();
  });

  devPrismaClient.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const duration = Date.now() - before;
    // Log more info about where the query possibly originated from
    console.log(highlightSql(`Prisma ${params.model}.${params.action} took ${duration}ms`));
    console.log();
    return result;
  });

  prismaClient = devPrismaClient;
}

export const prisma = prismaClient;
