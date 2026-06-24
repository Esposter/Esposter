import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { describe } from "vitest";

export const createOriginalRowValues = (rows: Row[], columnName: string) =>
  rows.map((row) => row.data[columnName] ?? null);

describe.todo("createOriginalRowValues");
