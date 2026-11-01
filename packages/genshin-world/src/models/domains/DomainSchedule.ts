import { DomainKind } from "#src/models/domains/DomainKind";
import { domainLevelSchema } from "#src/models/domains/DomainLevel";
import { z } from "zod";

// A challenge domain's kind, the artifact sets a Domain of Blessing's claim draws its artifacts among (none for the other
// Kinds, and none yet for the Blessing domains, whose sets the dump's text does not name), and its levels, read by its
// Entrance's entry id
export const domainScheduleSchema = z.object({
  artifactSetIds: z.array(z.int().positive()),
  kind: z.enum(DomainKind),
  levels: z.array(domainLevelSchema),
});

export type DomainSchedule = z.infer<typeof domainScheduleSchema>;
