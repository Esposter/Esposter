import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { benchColumns } from "@/composables/resource/sheet/commands/constants.bench";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";

export const createBenchDataSource = (rows: Row[]) => createDataSource(benchColumns, [...rows]);
