import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import {
  ENGLISH_GAME_TEXT,
  GameLanguage,
  GameTextLoaderMap,
  getAcceptLanguageTags,
  matchGameLanguage,
} from "genshin-text";

// The game's own words in the reader's language, the one of the game's fifteen nearest their browser's: read off the
// Request's `Accept-Language` on the server and handed to the client in the payload, so the page hydrates in the
// Language it rendered in and downloads that language's chunk alone. English while nothing has loaded
export const useGameText = async () => {
  const acceptLanguage = useRequestHeader("accept-language") ?? "";
  const { data } = await useAsyncData(
    AsyncDataKey.GameText,
    async () => {
      const language = matchGameLanguage(
        import.meta.server ? getAcceptLanguageTags(acceptLanguage) : navigator.languages,
      );
      return { language, text: await GameTextLoaderMap[language]() };
    },
    { default: () => ({ language: GameLanguage.English, text: ENGLISH_GAME_TEXT }) },
  );
  return data;
};
