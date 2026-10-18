<script setup lang="ts">
import type { Tokens } from "marked";

import { createRepositoryPathLinkifier } from "@/services/agentConsole/linkifyRepositoryPaths";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsoleFileStore } from "@/store/agentConsole/file";
import { useAgentConsolePaneStore } from "@/store/agentConsole/pane";
import { sanitizeHtml } from "@esposter/shared";
import { CommandType } from "agent-console-server/contracts";
import { marked } from "marked";

interface Props {
  source: string;
}

const { source } = defineProps<Props>();
const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
const { sendCommand } = agentConsoleConnectionStore;
const agentConsoleFileStore = useAgentConsoleFileStore();
const { files } = storeToRefs(agentConsoleFileStore);
const repositoryPathLinkifier = computed(() => createRepositoryPathLinkifier(files.value));
const agentConsolePaneStore = useAgentConsolePaneStore();
const { openPage } = agentConsolePaneStore;
// The session the message is shown in, so a file opened from the side chat reads through the side chat's session
const { sessionId } = useAgentConsoleSession();
const openRepositoryFile = (path: string) =>
  sendCommand({ path, sessionId: sessionId.value, type: CommandType.ReadFile });
// A link to a page of this app opens in the side pane, unless a modifier asks for a tab of its own or it only moves to
// An anchor on this page. Its target is not read, since the sanitizer gives every link one. A template cannot see a
// Language global, so the link is read here
const openLinkInPane = (event: MouseEvent) => {
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (link?.getAttribute("href") === "#agent-console-file") {
    event.preventDefault();
    const path = link.textContent ?? "";
    if (!files.value.includes(path)) return;
    openRepositoryFile(path);
    return;
  }
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const url = new URL(link.href);
  if (
    url.origin !== window.location.origin ||
    (url.hash && url.pathname === window.location.pathname && url.search === window.location.search)
  )
    return;
  event.preventDefault();
  openPage(`${url.pathname}${url.search}`);
};
// A code block stays its own block, so it copies on its own; everything else the agent writes is rendered as markdown
// And never trusted, sanitized like any other markdown the app shows
const blocks = computed(() =>
  marked
    .lexer(source)
    .map((token): string | Tokens.Code =>
      token.type === "code"
        ? (token as Tokens.Code)
        : sanitizeHtml(repositoryPathLinkifier.value.linkifyHtml(sanitizeHtml(marked.parser([token])))),
    ),
);
</script>

<template>
  <div class="markdown" flex flex-col gap-2 min-w-0 @click="openLinkInPane($event)">
    <template v-for="(block, index) of blocks" :key="index">
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized above -->
      <div v-if="typeof block === 'string'" v-html="block" />
      <div v-else relative>
        <pre p-2 of-x-auto><code v-html="repositoryPathLinkifier.linkifyCode(block.text)" /></pre>
        <UiCopyButton :source="block.text" right-1 top-1 absolute />
      </div>
    </template>
  </div>
</template>

<style scoped>
.markdown pre,
.markdown :deep(pre) {
  background-color: var(--ui-background);
}

.markdown :deep(a) {
  color: var(--ui-info);
}

.markdown :deep(a:hover) {
  text-decoration: underline;
}

/* The reset takes a list's markers away, and the agent's lists are read by them */
.markdown :deep(:is(ul, ol)) {
  padding-left: 1.5rem;
  list-style: revert;
}
</style>
