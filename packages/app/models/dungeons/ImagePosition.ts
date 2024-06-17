import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";

export type ImagePosition = Pick<ImageConfiguration, "x" | "y" | "originX" | "originY">;
