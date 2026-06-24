import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { describe } from "vitest";

export const createDateColumn = (name: string, format: DateColumn["format"]): DateColumn =>
  new DateColumn({ format, name, size: 0, sourceName: name });

describe.todo("createDateColumn");
