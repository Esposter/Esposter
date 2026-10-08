import { z } from "zod";

// An item the game takes into an artifact as EXP: its id and how much EXP one of it adds, before the enhancement's bonus
export interface ArtifactExpMaterial {
  experience: number;
  id: number;
}

export const artifactExpMaterialSchema = z.object({
  experience: z.int().positive(),
  id: z.int().positive(),
}) satisfies z.ZodType<ArtifactExpMaterial>;
