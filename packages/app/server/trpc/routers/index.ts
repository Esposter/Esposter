import { router } from "@@/server/trpc";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { appRouter } from "@@/server/trpc/routers/app";
import { blockRouter } from "@@/server/trpc/routers/block";
import { callRouter } from "@@/server/trpc/routers/call";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { dungeonsRouter } from "@@/server/trpc/routers/dungeons";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { likeRouter } from "@@/server/trpc/routers/like";
import { messageRouter } from "@@/server/trpc/routers/message";
import { postRouter } from "@@/server/trpc/routers/post";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { userRouter } from "@@/server/trpc/routers/user";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
// We need to declare a base router without achievements to avoid circular dependencies
const trpcRouterWithoutAchievements = router({
  app: appRouter,
  block: blockRouter,
  callSession: callRouter,
  clicker: clickerRouter,
  dashboard: dashboardRouter,
  dungeons: dungeonsRouter,
  emailEditor: emailEditorRouter,
  flowchartEditor: flowchartEditorRouter,
  friend: friendRouter,
  friendRequest: friendRequestRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  pushSubscription: pushSubscriptionRouter,
  role: roleRouter,
  room: roomRouter,
  searchHistory: searchHistoryRouter,
  survey: surveyRouter,
  tableEditor: tableEditorRouter,
  user: userRouter,
  userToRoom: userToRoomRouter,
  webhook: webhookRouter,
  webpageEditor: webpageEditorRouter,
});

export type TRPCRouterWithoutAchievements = typeof trpcRouterWithoutAchievements;

export const trpcRouter = mergeRouters(trpcRouterWithoutAchievements, router({ achievement: achievementRouter }));

export type TRPCRouter = typeof trpcRouter;
