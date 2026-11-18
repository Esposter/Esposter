import { trpcRouter } from "#server/trpc/routers/index";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";

const path = "/path";
const title = "title";

// The bookmark router's cases for the app-wide live topic check: the dock reads the viewer's bookmarks, and a toggle
// Changes them
export const createBookmarkLiveTopicCalls = (): LiveTopicCalls => ({
  queries: [
    {
      call: (context) => createCallerFactory(trpcRouter)(context).bookmark.readBookmarks(),
      path: "bookmark.readBookmarks",
    },
  ],
  writes: [
    {
      call: (context) => createCallerFactory(trpcRouter)(context).bookmark.toggleBookmark({ path, title }),
      path: "bookmark.toggleBookmark",
    },
  ],
});
