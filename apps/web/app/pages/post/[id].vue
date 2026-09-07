<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { useCommentStore } from "@/store/post/comment";

definePageMeta({ validate: checkIsUuidRouteId });

const { data: session } = await authClient.useSession(useFetch);
const post = await useReadPostFromRoute();
const commentStore = useCommentStore();
const { currentPost } = storeToRefs(commentStore);
currentPost.value = post;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ post.title }}</Title>
    </Head>
    <v-container v-if="currentPost" flex flex-1 flex-col h-full>
      <v-row flex-none>
        <v-col>
          <PostCard :post="currentPost" is-comment-store />
        </v-col>
      </v-row>
      <v-row flex-1 flex-col>
        <v-col flex flex-1 flex-col>
          <StyledCard flex-1>
            <v-container v-if="session">
              <PostCommentCreateRichTextEditor :parent-id="currentPost.id" />
            </v-container>
            <v-container>
              <PostCommentEmptyBanner v-if="currentPost.commentCount === 0" />
              <PostCommentBranch v-else :parent-id="currentPost.id" :depth="0" />
            </v-container>
          </StyledCard>
        </v-col>
      </v-row>
      <PostConfirmDeleteDialog />
      <PostCommentConfirmDeleteDialog />
    </v-container>
  </NuxtLayout>
</template>
