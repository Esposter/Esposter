import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const existsExtension = {
  model: {
    $allModels: {
      async exists<T>(this: T, where: Prisma.Args<T, "findFirst">["where"]): Promise<boolean> {
        const context = Prisma.getExtensionContext(this);
        const result = await (context as any).count({ where });
        return result > 0;
      },
    },
  },
} satisfies Parameters<PrismaClient["$extends"]>[0] & { [K: string]: {} };
