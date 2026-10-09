import { EMBED_QUERY_KEY } from "@/services/app/constants";

// Whether the page is opened as an embed in the agent console's side pane, which asks for it with the embed flag in
// Its query. The layouts read it here, so no page has to know it is embedded
export const useIsEmbedded = () => {
  const { currentRoute } = useRouter();
  return computed(() => currentRoute.value.query[EMBED_QUERY_KEY] !== undefined);
};
