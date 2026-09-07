import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { describe } from "vitest";

export const createColumn = (name: string, size = 0): StringColumn =>
  new StringColumn({ name, size, sourceName: name });

describe.todo("createColumn");
