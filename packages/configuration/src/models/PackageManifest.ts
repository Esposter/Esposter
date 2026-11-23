import { z } from "zod";

export interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  // Each subpath's arm names its `source` file under `src`, which is the one place a package declares what a subpath is
  exports?: Record<string, Record<string, string> | string>;
  // What the build vendored into each bundle, with the version it resolved. A name the tree holds at several versions
  // Lists each one, so the value is a string or an array of them
  inlinedDependencies?: Record<string, string | string[]>;
  // Declared by the one package a runtime host loads by convention rather than by resolution — the Functions app
  main?: string;
  name?: string;
  optionalDependencies?: Record<string, string>;
  packageManager?: string;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  private?: boolean;
  scripts?: Record<string, string>;
}

const stringRecordSchema = z.record(z.string(), z.string());

// The fields the build reads, each of the type the interface names. A field the build does not read is stripped
export const packageManifestSchema: z.ZodType<PackageManifest> = z.object({
  dependencies: stringRecordSchema.exactOptional(),
  devDependencies: stringRecordSchema.exactOptional(),
  engines: stringRecordSchema.exactOptional(),
  exports: z.record(z.string(), z.union([z.string(), stringRecordSchema])).exactOptional(),
  main: z.string().exactOptional(),
  name: z.string().exactOptional(),
  optionalDependencies: stringRecordSchema.exactOptional(),
  packageManager: z.string().exactOptional(),
  peerDependencies: stringRecordSchema.exactOptional(),
  peerDependenciesMeta: z.record(z.string(), z.object({ optional: z.boolean().exactOptional() })).exactOptional(),
  private: z.boolean().exactOptional(),
  scripts: stringRecordSchema.exactOptional(),
});
