<!-- A message still on its way, in a message's own shape: the author's picture, the name over two lines of text -->
<template>
  <div mt-4 px-4 py-1 flex gap-4>
    <div flex shrink-0 justify-center w="[var(--avatar-width)]">
      <UiSkeleton size-8 />
    </div>
    <div flex flex-1 flex-col gap-2 min-w-0>
      <UiSkeleton h-4 w="1/5" />
      <UiSkeleton h-4 w-full />
      <UiSkeleton h-4 w="3/5" />
    </div>
  </div>
</template>
