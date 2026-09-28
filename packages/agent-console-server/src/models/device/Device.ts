import { z } from "zod";

// A page paired with this host. Only the credential's hash is kept, so reading the file never yields a credential
export interface Device {
  createdAt: Date;
  credentialHash: string;
  id: string;
  // The browser and system it paired from, read from its user agent, so a list of devices can be told apart
  name: string;
  origin: string;
}

export const deviceSchema: z.ZodObject<{
  createdAt: z.ZodCoercedDate;
  credentialHash: z.ZodString;
  id: z.ZodString;
  name: z.ZodString;
  origin: z.ZodString;
}> = z.object({
  createdAt: z.coerce.date(),
  credentialHash: z.string().min(1),
  id: z.string().min(1),
  name: z.string(),
  origin: z.string(),
}) satisfies z.ZodType<Device>;
