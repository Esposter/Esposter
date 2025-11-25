import { router } from "@@/server/trpc";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { appRouter } from "@@/server/trpc/routers/app";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { dungeonsRouter } from "@@/server/trpc/routers/dungeons";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { likeRouter } from "@@/server/trpc/routers/like";
import { messageRouter } from "@@/server/trpc/routers/message";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { postRouter } from "@@/server/trpc/routers/post";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roomRouter } from "@@/server/trpc/routers/room";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { userRouter } from "@@/server/trpc/routers/user";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";

export const trpcRouter = router({
  achievement: achievementRouter,
  app: appRouter,
  clicker: clickerRouter,
  dashboard: dashboardRouter,
  dungeons: dungeonsRouter,
  emailEditor: emailEditorRouter,
  emoji: emojiRouter,
  flowchartEditor: flowchartEditorRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  pushSubscription: pushSubscriptionRouter,
  room: roomRouter,
  searchHistory: searchHistoryRouter,
  survey: surveyRouter,
  tableEditor: tableEditorRouter,
  user: userRouter,
  userToRoom: userToRoomRouter,
  webhook: webhookRouter,
  webpageEditor: webpageEditorRouter,
});

export type TRPCRouter = typeof trpcRouter;
