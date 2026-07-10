import type { Row } from "#shared/models/resource/file/datasource/Row";

import { benchColumns } from "@/composables/resource/file/commands/constants.bench";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";

export const createBenchDataSource = (rows: Row[]) => createDataSource(benchColumns, [...rows]);
