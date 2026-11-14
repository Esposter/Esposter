import { z } from "zod";

// The participant token a survey response names: "" in Anonymous mode, else the token the program issued
export const participantTokenInputSchema = z.union([z.literal(""), z.uuidv4()]);
