import type { Upgrade } from "@/models/clicker";
import { UpgradeTarget, UpgradeType } from "@/models/clicker";
import { router } from "@/server/trpc";
import { rateLimitedProcedure } from "@/server/trpc/procedure";
import { CLICKER_UPGRADES_PATH } from "@/util/constants.server";
import readXlsxFile from "read-excel-file/node";
import { toZod } from "tozod";
import { z } from "zod";

// @NOTE: Hacking the types to support enums
// Hopefully we can remove this if toZod decides to support it
export const upgradesSchema: z.ZodArray<
  z.ZodObject<
    z.extendShape<
      toZod<Upgrade>["shape"],
      {
        upgradeTarget: z.ZodNativeEnum<typeof UpgradeTarget>;
        upgradeType: z.ZodNativeEnum<typeof UpgradeType>;
      }
    >
  >
> = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
    flavorDescription: z.string(),
    price: z.number().int(),
    value: z.number().int(),
    upgradeTarget: z.nativeEnum(UpgradeTarget),
    upgradeType: z.nativeEnum(UpgradeType),
  })
);

export const clickerRouter = router({
  readUpgrades: rateLimitedProcedure.query(async () => {
    const response = await fetch(`${process.env.AZURE_BLOB_URL}${CLICKER_UPGRADES_PATH}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { rows } = await readXlsxFile(buffer, {
      map: Object.keys(upgradesSchema.element.shape).reduce<Record<string, string>>((acc, curr) => {
        acc[curr] = curr;
        return acc;
      }, {}),
    });
    try {
      return upgradesSchema.parse(rows);
    } catch (e) {
      return null;
    }
  }),
});
