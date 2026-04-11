import { router } from "@@/server/trpc";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { appRouter } from "@@/server/trpc/routers/app";
import { blockRouter } from "@@/server/trpc/routers/block";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { dungeonsRouter } from "@@/server/trpc/routers/dungeons";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { likeRouter } from "@@/server/trpc/routers/like";
import { messageRouter } from "@@/server/trpc/routers/message";
import { emojiRouter } from "@@/server/trpc/routers/message/emoji";
import { postRouter } from "@@/server/trpc/routers/post";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roomRouter } from "@@/server/trpc/routers/room";
import { directMessageRouter } from "@@/server/trpc/routers/room/directMessage";
import { voiceRouter } from "@@/server/trpc/routers/room/voice";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { userRouter } from "@@/server/trpc/routers/user";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
// We need to declare a base router without achievements to avoid circular dependencies
const trpcRouterWithoutAchievements = router({
  app: appRouter,
  block: blockRouter,
  clicker: clickerRouter,
  dashboard: dashboardRouter,
  directMessage: directMessageRouter,
  dungeons: dungeonsRouter,
  emailEditor: emailEditorRouter,
  emoji: emojiRouter,
  flowchartEditor: flowchartEditorRouter,
  friend: friendRouter,
  friendRequest: friendRequestRouter,
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
  voice: voiceRouter,
  webhook: webhookRouter,
  webpageEditor: webpageEditorRouter,
});

export type TRPCRouterWithoutAchievements = typeof trpcRouterWithoutAchievements;

export const trpcRouter = router({
  achievement: achievementRouter,
  ...trpcRouterWithoutAchievements._def.procedures,
});

export type TRPCRouter = typeof trpcRouter;
