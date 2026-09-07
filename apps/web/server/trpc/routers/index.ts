import { router } from "@@/server/trpc";
import { achievementRouter } from "@@/server/trpc/routers/achievement";
import { appRouter } from "@@/server/trpc/routers/app";
import { blockRouter } from "@@/server/trpc/routers/block";
import { blueprintRouter } from "@@/server/trpc/routers/blueprint";
import { callRouter } from "@@/server/trpc/routers/call";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { datasetRouter } from "@@/server/trpc/routers/dataset";
import { dungeonsRouter } from "@@/server/trpc/routers/dungeons";
import { emailRouter } from "@@/server/trpc/routers/email";
import { flowchartRouter } from "@@/server/trpc/routers/flowchart";
import { friendRouter } from "@@/server/trpc/routers/friend";
import { friendRequestRouter } from "@@/server/trpc/routers/friendRequest";
import { likeRouter } from "@@/server/trpc/routers/like";
import { messageRouter } from "@@/server/trpc/routers/message";
import { noteRouter } from "@@/server/trpc/routers/note";
import { notificationRouter } from "@@/server/trpc/routers/notification";
import { postRouter } from "@@/server/trpc/routers/post";
import { programRouter } from "@@/server/trpc/routers/program";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { sessionRouter } from "@@/server/trpc/routers/session";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { storageRouter } from "@@/server/trpc/routers/storage";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { todoListRouter } from "@@/server/trpc/routers/todoList";
import { userRouter } from "@@/server/trpc/routers/user";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { webhookRouter } from "@@/server/trpc/routers/webhook";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
// A base router without achievements, which the achievement router would otherwise import circularly
const baseTrpcRouter = router({
  app: appRouter,
  block: blockRouter,
  blueprint: blueprintRouter,
  callSession: callRouter,
  clicker: clickerRouter,
  dashboard: dashboardRouter,
  dataset: datasetRouter,
  dungeons: dungeonsRouter,
  email: emailRouter,
  flowchart: flowchartRouter,
  friend: friendRouter,
  friendRequest: friendRequestRouter,
  like: likeRouter,
  message: messageRouter,
  note: noteRouter,
  notification: notificationRouter,
  post: postRouter,
  program: programRouter,
  pushSubscription: pushSubscriptionRouter,
  resource: resourceRouter,
  role: roleRouter,
  room: roomRouter,
  searchHistory: searchHistoryRouter,
  session: sessionRouter,
  sheet: sheetRouter,
  storage: storageRouter,
  survey: surveyRouter,
  todoList: todoListRouter,
  user: userRouter,
  userToRoom: userToRoomRouter,
  webhook: webhookRouter,
  webpage: webpageRouter,
});

export type BaseTRPCRouter = typeof baseTrpcRouter;

export const trpcRouter = mergeRouters(baseTrpcRouter, router({ achievement: achievementRouter }));

export type TRPCRouter = typeof trpcRouter;
