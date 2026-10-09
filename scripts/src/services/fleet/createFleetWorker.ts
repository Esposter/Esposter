import { randomBytes } from "node:crypto";

// A short random id for a worker that was given none, unique enough among the workers of one machine
export const createFleetWorker = (): string => randomBytes(2).toString("hex");
