import { isProd } from "@/util/constants";
import { Prisma, PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { highlight, Theme } from "cli-highlight";

let prismaClient: PrismaClient;

if (isProd) prismaClient = new PrismaClient({ log: ["error"] });
else {
  prismaClient = new PrismaClient({
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

  // @ts-ignore @NOTE Remove this once prisma team fixes their types :c
  prismaClient.$on("query", async (e: Prisma.QueryEvent) => {
    console.log(highlightSql(`Query: ${e.query}`));
    console.log(highlightSql(`Parameters: ${e.params}`));
    console.log(highlightSql(`Duration: ${e.duration}ms`));
    console.log(highlightSql(`Target: ${e.target}ms`));
    console.log(highlightSql(`Time: ${e.timestamp}`));
  });

  prismaClient.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const duration = Date.now() - before;
    // Log more info about where the query possibly originated from
    console.log(`Prisma ${params.model}.${params.action} took ${duration}ms\n`);
    return result;
  });
}

const highlightSql = (sql: string) => {
  const theme: Theme = {
    keyword: chalk.blueBright,
    literal: chalk.blueBright,
    string: chalk.white,
    type: chalk.magentaBright,
    built_in: chalk.magentaBright,
    comment: chalk.gray,
  };
  return highlight(sql, { theme, language: "sql" });
};

export const prisma = prismaClient;
