import { isProd } from "@/util/constants.server";
import { PrismaClient } from "@prisma/client";
import dedent from "dedent";
import { highlight } from "sql-highlight";

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
    console.log(
      highlight(dedent`Query: ${e.query}
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
    console.log(highlight(`Prisma ${params.model}.${params.action} took ${duration}ms`));
    console.log();
    return result;
  });

  prismaClient = devPrismaClient;
}

export const prisma = prismaClient;
