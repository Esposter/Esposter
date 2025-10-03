export const joinWithOxfordOr = (items: string[]) => {
  if (items.length === 1) return items[0];
  else if (items.length === 2) return `${items[0]} or ${items[1]}`;
  else return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
};
