import { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import { describe } from "vitest";

export const createBooleanColumn = (name: string): BooleanColumn =>
  new BooleanColumn({ name, size: 0, sourceName: name });

describe.todo("createBooleanColumn");
