import { takeOne } from "@esposter/shared";

export const joinWithOxfordOr = (items: string[]) => {
  if (items.length === 1) return takeOne(items);
  else if (items.length === 2) return `${takeOne(items)} or ${takeOne(items, 1)}`;
  else return `${items.slice(0, -1).join(", ")}, or ${takeOne(items, items.length - 1)}`;
};
