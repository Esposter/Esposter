import { env } from "@/env.client";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";

export const useClientUrl = () => `${env.NUXT_PUBLIC_BASE_URL}${TRPC_CLIENT_PATH}`;
