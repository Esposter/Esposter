<script setup lang="ts">
import { testUser } from "@/assets/data/test";
import { PostWithRelations } from "@/prisma/types";
import { useLikeStore } from "@/store/useLikeStore";
import { Prisma } from "@prisma/client";

interface LikeSectionProps {
  post: PostWithRelations;
}

const props = defineProps<LikeSectionProps>();
const { post } = $(toRefs(props));
const id = $computed<Prisma.LikeUserIdPostIdCompoundUniqueInput>(() => ({ postId: post.id, userId: testUser.id }));
const { $client } = useNuxtApp();
const likeStore = useLikeStore();
const { createLike, updateLike, deleteLike } = likeStore;
const liked = $computed(() => Boolean(post.likes.find((l) => l.userId === testUser.id && l.value === 1)));
const unliked = $computed(() => Boolean(post.likes.find((l) => l.userId === testUser.id && l.value === -1)));
const onCreateLike = async (value: 1 | -1) => {
  const newLike = await $client.like.createLike.mutate({ ...id, value });
  if (newLike) createLike(newLike);
};
const onUpdateLike = async (value: 1 | -1) => {
  const updatedLike = await $client.like.updateLike.mutate({ ...id, value });
  if (updatedLike) updateLike(updatedLike);
};
const onDeleteLike = async () => {
  const successful = await $client.like.deleteLike.mutate(id);
  if (successful) deleteLike(id);
};
</script>

<template>
  <div display="flex" flex="col" items="center">
    <v-btn
      min-width="24"
      w="6!"
      h="6!"
      p="0!"
      bg="transparent!"
      rd="1!"
      variant="flat"
      @click="liked ? onDeleteLike() : unliked ? onUpdateLike(1) : onCreateLike(1)"
    >
      <v-icon
        size="x-large"
        :color="liked ? 'primary' : undefined"
        :icon="liked ? 'mdi-arrow-up-bold' : 'mdi-arrow-up-bold-outline'"
      >
      </v-icon>
    </v-btn>
    {{ post.noLikes }}
    <v-btn
      min-width="24"
      w="6!"
      h="6!"
      p="0!"
      bg="transparent!"
      rd="1!"
      variant="flat"
      @click="unliked ? onDeleteLike() : liked ? onUpdateLike(-1) : onCreateLike(-1)"
    >
      <v-icon
        size="x-large"
        :color="unliked ? 'error' : undefined"
        :icon="unliked ? 'mdi-arrow-down-bold' : 'mdi-arrow-down-bold-outline'"
      >
      </v-icon>
    </v-btn>
  </div>
</template>
