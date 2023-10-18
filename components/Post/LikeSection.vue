<script setup lang="ts">
import type { PostWithRelations } from "@/db/schema/posts";
import { useLikeStore } from "@/store/post/like";

interface PostLikeSectionProps {
  post: PostWithRelations;
}

const { post } = defineProps<PostLikeSectionProps>();
const { $client } = useNuxtApp();
const { session } = useAuth();
const likeStore = useLikeStore();
const { createLike, updateLike, deleteLike } = likeStore;
const liked = computed(() => post.likes.some((l) => l.userId === session.value?.user.id && l.value === 1));
const unliked = computed(() => post.likes.some((l) => l.userId === session.value?.user.id && l.value === -1));
const onCreateLike = async (value: 1 | -1) => {
  const newLike = await $client.like.createLike.mutate({ postId: post.id, value });
  if (newLike) createLike(newLike);
};
const onUpdateLike = async (value: 1 | -1) => {
  const updatedLike = await $client.like.updateLike.mutate({ postId: post.id, value });
  if (updatedLike) updateLike(updatedLike);
};
const onDeleteLike = async () => {
  if (!session.value) return;

  await $client.like.deleteLike.mutate({ postId: post.id });
  deleteLike({ userId: session.value.user.id, postId: post.id });
};
</script>

<template>
  <div flex flex-col items-center>
    <v-btn
      p-0="!"
      rd-1="!"
      bg-transparent="!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
      @click="liked ? onDeleteLike() : unliked ? onUpdateLike(1) : onCreateLike(1)"
    >
      <v-icon
        size="x-large"
        :color="liked ? 'primary' : undefined"
        :icon="liked ? 'mdi-arrow-up-bold' : 'mdi-arrow-up-bold-outline'"
      />
    </v-btn>
    {{ post.noLikes }}
    <v-btn
      p-0="!"
      rd-1="!"
      bg-transparent="!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
      @click="unliked ? onDeleteLike() : liked ? onUpdateLike(-1) : onCreateLike(-1)"
    >
      <v-icon
        size="x-large"
        :color="unliked ? 'error' : undefined"
        :icon="unliked ? 'mdi-arrow-down-bold' : 'mdi-arrow-down-bold-outline'"
      />
    </v-btn>
  </div>
</template>
