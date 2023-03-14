import { router } from "@/server/trpc";
import { chatbotRouter } from "@/server/trpc/routers/chatbot";
import { clickerRouter } from "@/server/trpc/routers/clicker";
import { emojiRouter } from "@/server/trpc/routers/emoji";
import { likeRouter } from "@/server/trpc/routers/like";
import { messageRouter } from "@/server/trpc/routers/message";
import { postRouter } from "@/server/trpc/routers/post";
import { roomRouter } from "@/server/trpc/routers/room";
import { tableEditorRouter } from "@/server/trpc/routers/tableEditor";
import { userRouter } from "@/server/trpc/routers/user";

export const appRouter = router({
  chatbot: chatbotRouter,
  clicker: clickerRouter,
  emoji: emojiRouter,
  like: likeRouter,
  message: messageRouter,
  post: postRouter,
  room: roomRouter,
  tableEditor: tableEditorRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
