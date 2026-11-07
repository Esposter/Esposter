import type { ProvenanceSource } from "#src/models/provenance/Provenance";

// What a stamp is written from: the command that ran, the repository code it ran with, the sources the output was built
// From, each with the commit or SHA-256 it was fetched at where it has one, and the pinned tools the command ran
export interface ProvenanceOptions {
  command: string;
  producerPaths: string[];
  sources?: ProvenanceSource[];
  tools?: ProvenanceTool[];
}

// A pinned tool a command ran, by its name and the path of its binary. The stamp keeps the binary's SHA-256 and never its path
export interface ProvenanceTool {
  name: string;
  path: string;
}
