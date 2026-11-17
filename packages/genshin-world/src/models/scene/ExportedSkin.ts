import { z } from "zod";

// The skin of a mesh as its export's JSON holds it, the bones each vertex follows strongest first
export interface ExportedSkin {
  m_Skin: { boneIndex: number[] }[];
}

export const exportedSkinSchema = z.object({
  m_Skin: z.array(z.object({ boneIndex: z.array(z.int().nonnegative()) })),
}) satisfies z.ZodType<ExportedSkin>;
