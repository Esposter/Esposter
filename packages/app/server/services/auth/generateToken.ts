import { randomBytes } from "node:crypto";

export const generateToken = () => randomBytes(32).toString("hex");
