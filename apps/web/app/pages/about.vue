<template>
  <NuxtLayout>
    <article px-4 py-8 flex flex-col gap-16 items-center ui-body>
      <AboutHeader />
      <AboutContent />
      <AboutSupporters />
      <section flex flex-col gap-4 items-center>
        <h2 text-center ui-heading>Here's a globe for you to play around with if you are bored 🙂</h2>
        <ClientOnly>
          <VisualGlobe />
        </ClientOnly>
      </section>
    </article>
  </NuxtLayout>
</template>
