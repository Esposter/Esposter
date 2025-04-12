import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { Serializable } from "#shared/models/entity/Serializable";
import { type } from "arktype";

export class BasicChartConfiguration extends Serializable {
  dataLabels?: boolean;
  subtitle?: string;
  title?: string;
}

export const basicChartConfigurationSchema = type({
  dataLabels: "boolean = false",
  subtitle: "string = ''",
  title: "string = ''",
}) satisfies Type<ToData<BasicChartConfiguration>>;
