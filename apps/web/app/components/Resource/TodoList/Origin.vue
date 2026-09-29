<script setup lang="ts">
import type { TodoListItemOrigin } from "#shared/models/resource/todoList/TodoListItemOrigin";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const modelValue = defineModel<TodoListItemOrigin>({ required: true });
</script>

<!-- Where a follow-up came from: its repository, and the session that wrote it with the command that resumes it -->
<template>
  <div text-sm flex flex-col gap-1>
    <div flex gap-2 items-center>
      <UiIcon :meaning="UiIconMeaning.Terminal" text-muted />
      <span flex-1 min-w-0 truncate>
        Follow-up from <strong>{{ modelValue.repository }}</strong>
      </span>
      <UiCopyButton label="Copy resume command" :source="`claude --resume ${modelValue.sessionId}`" />
    </div>
    <p text-muted>
      <code>claude --resume {{ modelValue.sessionId }}</code> works only on the machine holding the session, from its
      project folder.
    </p>
  </div>
</template>
