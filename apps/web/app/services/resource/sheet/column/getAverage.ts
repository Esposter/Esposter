import { getSummation } from "@/services/resource/sheet/column/getSummation";

export const getAverage = (values: number[]): number => getSummation(values) / values.length;
