import { router } from "@/server/trpc";
import { appRouter } from "@/server/trpc/routers/app";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { dashboardRouter } from "@/server/trpc/routers/dashboard";
import { dungeonsRouter } from "@/server/trpc/routers/dungeons";
import { emailEditorRouter } from "@/server/trpc/routers/emailEditor";
import { likeRouter } from "@/server/trpc/routers/like";
import { messageRouter } from "@/server/trpc/routers/message";
import { emojiRouter } from "@/server/trpc/routers/message/emoji";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { surveyRouter } from "@/server/trpc/routers/survey";
import { tableEditorRouter } from "@/server/trpc/routers/tableEditor";
import { userRouter } from "@/server/trpc/routers/user";

export const trpcRouter = router({
  app: appRouter,
  clicker: clickerRouter,
  dashboard: dashboardRouter,
  dungeons: dungeonsRouter,
  emailEditor: emailEditorRouter,
  emoji: emojiRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  room: roomRouter,
  survey: surveyRouter,
  tableEditor: tableEditorRouter,
  user: userRouter,
});

export type TrpcRouter = typeof trpcRouter;
