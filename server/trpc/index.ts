import type { User } from "@prisma/client";
import { NIL } from "uuid";
import type { PostWithRelations } from "@/prisma/types";
import { chatbotRouter } from "@/server/trpc/chatbot";
import { createRouter } from "@/server/trpc/createRouter";
import { messageRouter } from "@/server/trpc/message";
import { postRouter } from "@/server/trpc/post";
import { roomRouter } from "@/server/trpc/room";
import { userRouter } from "@/server/trpc/user";

export const router = createRouter()
  .merge("user.", userRouter)
  .merge("room.", roomRouter)
  .merge("post.", postRouter)
  .merge("message.", messageRouter)
  .merge("chatbot.", chatbotRouter);

// @NOTE: Delete this once auth is implemented with Nuxt-Auth
export const testUser: User = {
  id: NIL,
  username: "Yah boi",
  avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const testPost: PostWithRelations = {
  id: NIL,
  title: "Hello!",
  description: "Lorem Ipsum",
  creator: testUser,
  creatorId: testUser.id,
  ranking: 0,
  edited: false,
  noPoints: 1,
  noComments: 1,
  depth: 0,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
