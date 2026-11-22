import type { SocialProvider } from "#shared/models/auth/SocialProvider";

export interface LoginButtonProps {
  logo: Component;
  provider: SocialProvider;
}
