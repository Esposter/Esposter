import { PrismaClient } from "@prisma/client";
import { highlight } from "sql-highlight";
import { isProd } from "@/util/constants.server";

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
    console.log(highlight(`Query: ${e.query}`));
    console.log(highlight(`Parameters: ${e.params}`));
    console.log(highlight(`Duration: ${e.duration}ms`));
    console.log(highlight(`Target: ${e.target}`));
    console.log(highlight(`Time: ${e.timestamp}`));
  });

  devPrismaClient.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const duration = Date.now() - before;
    // Log more info about where the query possibly originated from
    console.log(highlight(`Prisma ${params.model}.${params.action} took ${duration}ms\n`));
    return result;
  });

  prismaClient = devPrismaClient;
}

export const prisma = prismaClient;
