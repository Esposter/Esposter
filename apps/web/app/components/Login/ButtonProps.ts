import type { betterAuth } from "better-auth";

export interface ButtonProps {
  logo: Component;
  provider: keyof NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;
}
