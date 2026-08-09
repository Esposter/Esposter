import type { Column } from "#shared/models/resource/sheet/column/Column";

import { toRawDeep } from "@esposter/shared";
import { describe } from "vitest";

export const createUpdatedColumn = <TOverrides extends Partial<Column>>(
  column: Column,
  overrides: TOverrides,
): Column & TOverrides => Object.assign(structuredClone(toRawDeep(column)), overrides);

describe.todo("createUpdatedColumn");
