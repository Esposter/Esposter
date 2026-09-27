import { getSummation } from "#shared/services/resource/sheet/column/getSummation";

export const getAverage = (values: number[]) => getSummation(values) / values.length;
