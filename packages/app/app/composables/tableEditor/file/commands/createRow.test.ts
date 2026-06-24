import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { describe } from "vitest";

export const createRow = (data: Record<string, boolean | null | number | string>): Row => new Row({ data });

describe.todo("createRow");
