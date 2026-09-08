import { getVisibleLength } from "#scripts/outdatedDependencies/getVisibleLength";

export const padEndVisible = (text: string, length: number): string =>
  `${text}${" ".repeat(Math.max(length - getVisibleLength(text), 0))}`;
