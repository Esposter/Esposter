import { router } from "@@/server/trpc";
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
import { roomRouter } from "@@/server/trpc/routers/room";
import { surveyRouter } from "@@/server/trpc/routers/survey";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";

export const trpcRouter = router({
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
  room: roomRouter,
  survey: surveyRouter,
  tableEditor: tableEditorRouter,
  webpageEditor: webpageEditorRouter,
});

export type TRPCRouter = typeof trpcRouter;
