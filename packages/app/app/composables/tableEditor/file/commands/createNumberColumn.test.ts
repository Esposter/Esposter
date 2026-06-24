import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { describe } from "vitest";

export const createNumberColumn = (name: string): NumberColumn => new NumberColumn({ name, size: 0, sourceName: name });

describe.todo("createNumberColumn");
