import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
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
