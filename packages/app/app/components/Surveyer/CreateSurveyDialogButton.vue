<template>
  <SurveyerCreateSurveyDialog :card-props="{ title: 'Create Survey' }">
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Create Survey">
        <template #activator="{ props }">
          <v-btn variant="elevated" :flat="false" :="props" @click="updateIsOpen(true)">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </SurveyerCreateSurveyDialog>
</template>
