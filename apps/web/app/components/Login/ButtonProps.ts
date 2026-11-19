import type { SocialProvider } from "#shared/models/auth/SocialProvider";

export interface ButtonProps {
  logo: Component;
  provider: SocialProvider;
}
