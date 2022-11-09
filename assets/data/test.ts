import { NIL } from "uuid";
import type { User } from "@prisma/client";
import type { PostWithRelations } from "@/prisma/types";

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
