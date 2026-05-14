<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col flex justify-center>
          <VisualGem />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <AboutHeader />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <AboutContent />
        </v-col>
      </v-row>
      <AboutSupporters />
      <v-row pt-12>
        <v-col text-center flex justify-center text-headline-small font="[Montserrat]" cols="12">
          Here's a globe for you to play around with if you are bored 🙂
        </v-col>
        <v-col flex justify-center>
          <ClientOnly>
            <VisualGlobe />
          </ClientOnly>
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
