import { ID_SEPARATOR } from "#src/util/id/constants";
import { checkIsRecord } from "#src/util/object/checkIsRecord";

// A composite key is its parts joined by the one separator, so items unique by the whole of it are told apart by it
export const getItemKey = (item: unknown, key: readonly string[] | string): unknown => {
  if (!checkIsRecord(item)) return undefined;
  return typeof key === "string" ? item[key] : key.map((part) => item[part]).join(ID_SEPARATOR);
};
