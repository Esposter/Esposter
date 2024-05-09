import { router } from "@/server/trpc";
import { appRouter } from "@/server/trpc/routers/app";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { dungeonsRouter } from "@/server/trpc/routers/dungeons";
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
  dungeons: dungeonsRouter,
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
