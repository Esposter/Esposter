import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { describe } from "vitest";

export const createEveryNthIndexedRows = (rows: Row[], step: number): IndexedRow[] =>
  rows.flatMap((row, index) => (index % step === 0 ? [{ index, row }] : []));

describe.todo("createEveryNthIndexedRows");
