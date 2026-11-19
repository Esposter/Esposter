import type { ButtonProps } from "#src/components/Login/ButtonProps";

import { SocialProvider } from "#shared/models/auth/SocialProvider";

// Each provider's mark, keyed by the shared provider list, so a provider added to that list has to get a mark here
const LoginButtonLogos = {
  [SocialProvider.Facebook]: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Facebook.vue"))),
  [SocialProvider.Github]: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Github.vue"))),
  [SocialProvider.Google]: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Google.vue"))),
} satisfies Record<SocialProvider, Component>;

export const LoginButtonItems: ButtonProps[] = Object.values(SocialProvider).map((provider) => ({
  logo: LoginButtonLogos[provider],
  provider,
}));
