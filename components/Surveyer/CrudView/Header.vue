<template>
  <v-toolbar pt-4 pr-4 color="surface">
    <v-toolbar-title>
      <div pt-4 flex items-center>
        <SurveyerSearchBar />
        <v-divider mx-4="!" thickness="2" inset vertical />
        <SurveyerCreateSurveyDialogButton />
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
