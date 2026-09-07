import type { betterAuth } from "better-auth";
import type { Component, CSSProperties } from "vue";

export interface ButtonProps {
  logo: Component;
  logoAttrs?: Record<string, unknown>;
  logoStyle?: CSSProperties;
  provider: keyof NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;
  style?: CSSProperties;
}
