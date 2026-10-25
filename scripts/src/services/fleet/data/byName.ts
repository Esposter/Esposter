export const byName = <T extends { name: string }>(left: T, right: T): number => (left.name < right.name ? -1 : 1);
