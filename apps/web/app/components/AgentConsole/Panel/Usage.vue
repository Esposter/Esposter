<script setup lang="ts">
import { TOKEN_COUNT_FORMAT } from "@/services/agentConsole/constants";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

const agentConsoleSessionStore = useAgentConsoleSessionStore();
const { contextUsage, rateLimit, turnResult } = storeToRefs(agentConsoleSessionStore);
</script>

<template>
  <dl gap-x-4 grid cols-2>
    <template v-if="contextUsage">
      <dt>Context</dt>
      <dd>
        {{ TOKEN_COUNT_FORMAT.format(contextUsage.totalTokens) }} of
        {{ TOKEN_COUNT_FORMAT.format(contextUsage.maxTokens) }} tokens · {{ Math.round(contextUsage.percentage) }}%
      </dd>
      <template v-if="contextUsage.autoCompactThreshold">
        <dt>Compacts at</dt>
        <dd>{{ TOKEN_COUNT_FORMAT.format(contextUsage.autoCompactThreshold) }} tokens</dd>
      </template>
    </template>
    <template v-if="turnResult">
      <dt>Cost</dt>
      <dd>${{ turnResult.totalCostUsd.toFixed(2) }}</dd>
    </template>
    <template v-if="rateLimit?.utilization !== undefined">
      <dt>{{ rateLimit.rateLimitType || "Usage" }}</dt>
      <dd :class="{ 'text-warning': rateLimit.status !== 'allowed' }">
        {{ Math.round(rateLimit.utilization * 100) }}%
      </dd>
    </template>
  </dl>
</template>

<style scoped>
dt {
  color: var(--ui-muted);
}
</style>
