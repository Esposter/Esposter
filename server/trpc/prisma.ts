import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { highlight } from "cli-highlight";
import { isProd } from "@/util/constants";

let prismaClient: PrismaClient;

if (isProd) prismaClient = new PrismaClient({ log: ["error"] });
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
    console.log(highlightSql(`Query: ${e.query}`));
    console.log(highlightSql(`Parameters: ${e.params}`));
    console.log(highlightSql(`Duration: ${e.duration}ms`));
    console.log(highlightSql(`Target: ${e.target}`));
    console.log(highlightSql(`Time: ${e.timestamp}`));
  });

  devPrismaClient.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const duration = Date.now() - before;
    // Log more info about where the query possibly originated from
    console.log(highlightSql(`Prisma ${params.model}.${params.action} took ${duration}ms\n`));
    return result;
  });

  prismaClient = devPrismaClient;
}

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

export const prisma = prismaClient;
