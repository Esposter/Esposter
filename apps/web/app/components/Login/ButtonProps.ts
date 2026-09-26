import type { betterAuth } from "better-auth";
import type { Component } from "vue";

export interface ButtonProps {
  logo: Component;
  provider: keyof NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;
}
