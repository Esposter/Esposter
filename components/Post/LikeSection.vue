<script setup lang="ts">
import { PostWithRelations } from "@/prisma/types";
import { useLikeStore } from "@/store/post/like";

interface PostLikeSectionProps {
  post: PostWithRelations;
}

const props = defineProps<PostLikeSectionProps>();
const { post } = $(toRefs(props));
const { $client } = useNuxtApp();
const { data } = $(useSession());
const likeStore = useLikeStore();
const { createLike, updateLike, deleteLike } = likeStore;
const liked = $computed(() => post.likes.some((l) => l.userId === data?.user.id && l.value === 1));
const unliked = $computed(() => post.likes.some((l) => l.userId === data?.user.id && l.value === -1));
const onCreateLike = async (value: 1 | -1) => {
  const newLike = await $client.like.createLike.mutate({ postId: post.id, value });
  createLike(newLike);
};
const onUpdateLike = async (value: 1 | -1) => {
  const updatedLike = await $client.like.updateLike.mutate({ postId: post.id, value });
  if (updatedLike) updateLike(updatedLike);
};
const onDeleteLike = async () => {
  if (!data) return;

  const successful = await $client.like.deleteLike.mutate({ postId: post.id });
  if (successful) deleteLike({ userId: data.user.id, postId: post.id });
};
</script>

<template>
  <div display="flex" flex="col" items="center">
    <v-btn
      p="0!"
      rd="1!"
      bg="transparent!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
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
      p="0!"
      rd="1!"
      bg="transparent!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
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
