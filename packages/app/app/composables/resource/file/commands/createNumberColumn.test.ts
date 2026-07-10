import { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import { describe } from "vitest";

export const createNumberColumn = (name: string): NumberColumn => new NumberColumn({ name, size: 0, sourceName: name });

describe.todo("createNumberColumn");
