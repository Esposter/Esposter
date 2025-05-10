<script setup lang="ts">
import type { ParsedFileEntity } from "@/models/esbabbler/file/ParsedFileEntity";

interface FileContainerProps {
  files: ParsedFileEntity[];
}

const { files } = defineProps<FileContainerProps>();
</script>

<template>
  <v-container v-if="files.length > 0" p-0 fluid>
    <v-row>
      <v-col v-for="file in files" :key="file.id" xl="2" lg="3" md="4" sm="6">
        <StyledCard rd-4>
          <EsbabblerFileRenderer :file />
        </StyledCard>
      </v-col>
    </v-row>
  </v-container>
</template>
