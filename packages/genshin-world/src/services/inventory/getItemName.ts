import { InvalidOperationError, Operation } from "@esposter/shared";

// An item's name read from the name-text chunks by its text id, which a name missing from them is an error for
export const getItemName = (nameTextId: string, names: Readonly<Record<string, string>>): string => {
  const name = names[nameTextId];
  if (name === undefined)
    throw new InvalidOperationError(Operation.Read, nameTextId, "names no text in the reader's language");
  return name;
};
