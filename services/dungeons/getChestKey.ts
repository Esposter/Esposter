import type { Position } from "grid-engine";

export const getChestKey = ({ x, y }: Position) => `${x}|${y}`;
