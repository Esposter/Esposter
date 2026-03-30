import type { XlsxDataSourceConfiguration } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import type { ToData } from "@esposter/shared";

import {
  ADataSourceItem,
  createDataSourceItemSchema,
} from "#shared/models/tableEditor/file/datasource/ADataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import { z } from "zod";

export class XlsxDataSourceItem extends ADataSourceItem<DataSourceType.Xlsx> {
  configuration: XlsxDataSourceConfiguration = { sheetIndex: 0 };
  override readonly type = DataSourceType.Xlsx;

  constructor(init?: Partial<XlsxDataSourceItem>) {
    super();
    Object.assign(this, init);
  }
}

export const xlsxDataSourceItemSchema = createDataSourceItemSchema(
  z.literal(DataSourceType.Xlsx),
  xlsxDataSourceConfigurationSchema,
) satisfies z.ZodType<ToData<XlsxDataSourceItem>>;
