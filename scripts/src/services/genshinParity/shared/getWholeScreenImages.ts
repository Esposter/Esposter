import type { WholeScreenImage } from "#src/models/genshinParity/WholeScreenImage";
import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

import {
  WHOLE_SCREEN_MAX_ASPECT_RATIO,
  WHOLE_SCREEN_MIN_ASPECT_RATIO,
  WHOLE_SCREEN_MIN_WIDTH,
} from "#src/services/genshinParity/shared/constants";

// The whole-screen screenshots an article's images answer with, widest first: a file at least as wide as a screen and
// Of a screen's shape, its size and URL read off the first imageinfo entry. A page with no imageinfo, or no title, is
// Left out rather than guessed at
export const getWholeScreenImages = (response: WikiImagesResponse): WholeScreenImage[] =>
  Object.values(response.query?.pages ?? {})
    .flatMap(({ imageinfo, title }) => {
      const info = imageinfo?.[0];
      if (info === undefined || title === undefined) return [];
      const aspectRatio = info.width / info.height;
      const isWholeScreen =
        info.width >= WHOLE_SCREEN_MIN_WIDTH &&
        aspectRatio >= WHOLE_SCREEN_MIN_ASPECT_RATIO &&
        aspectRatio <= WHOLE_SCREEN_MAX_ASPECT_RATIO;
      return isWholeScreen ? [{ height: info.height, title, url: info.url, width: info.width }] : [];
    })
    .toSorted((firstImage, secondImage) => secondImage.width - firstImage.width);
