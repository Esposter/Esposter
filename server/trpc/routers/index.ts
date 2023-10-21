import { router } from "@/server/trpc";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { dungeonsRouter } from "@/server/trpc/routers/dungeons";
import { emojiRouter } from "@/server/trpc/routers/emoji";
import { likeRouter } from "@/server/trpc/routers/like";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { surveyerRouter } from "@/server/trpc/routers/surveyer";
import { tableEditorRouter } from "@/server/trpc/routers/tableEditor";
import { userRouter } from "@/server/trpc/routers/user";

export const appRouter = router({
  clicker: clickerRouter,
  dungeons: dungeonsRouter,
  emoji: emojiRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  room: roomRouter,
  surveyer: surveyerRouter,
  tableEditor: tableEditorRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
