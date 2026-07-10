import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { describe } from "vitest";

export const createColumn = (name: string): StringColumn => new StringColumn({ name, size: 0, sourceName: name });

describe.todo("createColumn");
