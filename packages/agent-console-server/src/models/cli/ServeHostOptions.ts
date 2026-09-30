import type { SchemeLaunch } from "#src/models/installer/SchemeLaunch";

export interface ServeHostOptions {
  hostname: string;
  origin: string;
  port: number;
  // What the link Windows started the host with asked for, when a page's Connect started it
  schemeLaunch?: SchemeLaunch;
}
