import { BYTE } from "#src/services/shared/constants";

export const toPercent = (sum: number, count: number): number => (sum / Math.max(count, 1) / BYTE) * 100;
