<script setup lang="ts">
import type { Document, DocumentType } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { DocumentHeaders } from "@/services/document/DocumentHeaders";
import { DocumentTypeIconMap } from "@/services/document/DocumentTypeIconMap";
import { DocumentTypeRoutePathMap } from "@/services/document/DocumentTypeRoutePathMap";
import { DOCUMENT_ID_QUERY_PARAMETER_KEY } from "@/services/shared/constants";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const { items } = await $trpc.document.readDocuments.query();
const documents = ref(items);
const getDocumentIcon = (type: DocumentType) => DocumentTypeIconMap[type];
const openDocument = (document: Document) =>
  navigateTo({
    path: DocumentTypeRoutePathMap[document.type],
    query: { [DOCUMENT_ID_QUERY_PARAMETER_KEY]: document.id },
  });
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Document>) => openDocument(item);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Documents</Title>
    </Head>
    <StyledPageHeader />
    <v-container fluid>
      <StyledDataTable
        :data-table-props="{
          headers: DocumentHeaders,
          items: documents,
          sortBy: [{ key: 'updatedAt', order: 'desc' }],
        }"
        @click:row="onClickRow"
      >
        <template #[`item.type`]="{ item }">
          <div flex gap-2 items-center>
            <v-icon :icon="getDocumentIcon(item.type)" />
            {{ item.type }}
          </div>
        </template>
        <template #[`item.publishedAt`]="{ item }">
          <v-chip v-if="item.publishedAt" color="primary" size="small" text="Published" />
          <v-chip v-else size="small" text="Draft" />
        </template>
        <template #[`item.actions`]="{ item }">
          <StyledTooltipIconButton icon="mdi-open-in-new" text="Open" @click="openDocument(item)" />
        </template>
        <template #no-data>
          <StyledEmptyState
            icon="mdi-file-document-multiple-outline"
            title="No documents yet"
            description="Create a dashboard, table, email, webpage, or flowchart and it will show up here."
          />
        </template>
      </StyledDataTable>
    </v-container>
  </NuxtLayout>
</template>
