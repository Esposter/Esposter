import { z } from "zod";

// The platform, release and build the command ran on
export interface OperatingSystem {
  platform: string;
  release: string;
  version: string;
}

// The repository commit a command's code was at, whether its producer's paths held uncommitted changes then, and those paths
export interface ProducerVersion {
  commit: string;
  isDirty: boolean;
  producerPaths: string[];
}

// The provenance stamp an output carries beside it: the game version of the install it was read from,
// The command that wrote it, the operating system, the producer's commit and the pinned tools it ran. It holds no absolute path
export interface Provenance {
  command: string;
  gameVersion: string;
  operatingSystem: OperatingSystem;
  producer: ProducerVersion;
  sources: ProvenanceSource[];
  tools: ToolDigest[];
}

// A source an output was built from, by name, with the commit it was fetched at or the SHA-256 of its file where it has one
export interface ProvenanceSource {
  commit?: string;
  name: string;
  sha256?: string;
}

// A pinned tool a command ran, named and identified by the SHA-256 of its binary
export interface ToolDigest {
  name: string;
  sha256: string;
}

export const provenanceSchema: z.ZodType<Provenance> = z.object({
  command: z.string(),
  gameVersion: z.string(),
  operatingSystem: z.object({ platform: z.string(), release: z.string(), version: z.string() }),
  producer: z.object({ commit: z.string(), isDirty: z.boolean(), producerPaths: z.array(z.string()) }),
  sources: z.array(z.object({ commit: z.string().optional(), name: z.string(), sha256: z.string().optional() })),
  tools: z.array(z.object({ name: z.string(), sha256: z.string() })),
});
