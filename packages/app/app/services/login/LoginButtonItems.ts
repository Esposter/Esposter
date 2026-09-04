import type { ButtonProps } from "@/components/Login/ButtonProps";

export const LoginButtonItems: ButtonProps[] = [
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Google.vue`))),
    logoStyle: {
      backgroundColor: "#fff",
      borderRadius: "var(--border-radius) 0 0 var(--border-radius)",
      height: "3rem",
      padding: ".625rem",
      width: "3rem",
    },
    provider: "google",
    style: { backgroundColor: "#4285f4", paddingLeft: "0" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Github.vue`))),
    logoAttrs: { fill: "#fff" },
    provider: "github",
    style: { backgroundColor: "#252525" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Facebook.vue`))),
    provider: "facebook",
    style: { backgroundColor: "#1877f2" },
  },
];
