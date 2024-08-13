import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";

export type ImagePosition = Pick<ImageConfiguration, "originX" | "originY" | "x" | "y">;
