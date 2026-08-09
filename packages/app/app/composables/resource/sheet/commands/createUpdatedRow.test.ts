import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { toRawDeep } from "@esposter/shared";
import { describe } from "vitest";

export const createUpdatedRow = (row: Row, overrides: Partial<Row>): Row =>
  new Row(Object.assign(structuredClone(toRawDeep(row)), overrides));

describe.todo("createUpdatedRow");
