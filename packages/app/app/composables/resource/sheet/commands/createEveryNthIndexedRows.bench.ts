import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { describe } from "vitest";

export const createEveryNthIndexedRows = (rows: Row[], step: number): IndexedRow[] =>
  rows.flatMap((row, index) => (index % step === 0 ? [{ index, row }] : []));

describe.todo("createEveryNthIndexedRows");
