<template>
  <v-toolbar pt-4>
    <v-toolbar-title px-4>
      <div pt-4 flex items-center>
        <SurveySearchBar />
        <v-divider mx-4 thickness="2" vertical inset />
        <SurveyCreateSurveyDialogButton />
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
