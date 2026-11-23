import type { ExpMaterial } from "genshin-world";

// Largest EXP first, the order a level is raised with its materials in
export const compareExperienceDescending = (firstExpMaterial: ExpMaterial, secondExpMaterial: ExpMaterial): number =>
  secondExpMaterial.experience - firstExpMaterial.experience;
