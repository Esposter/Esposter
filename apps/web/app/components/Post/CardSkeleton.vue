<!-- A post card's own shape while the feed reads: the byline, the title, a few lines of the post and the footer's
  pills -->
<template>
  <div p-3 flex flex-col gap-3 ui-frame>
    <div flex gap-2 items-center>
      <UiSkeleton shrink-0 size-8 />
      <UiSkeleton h-3 w="1/4" />
    </div>
    <UiSkeleton h-5 w="2/3" />
    <UiSkeleton h-3 w-full />
    <UiSkeleton h-3 w="5/6" />
    <div flex gap-2>
      <UiSkeleton h-8 w-24 />
      <UiSkeleton h-8 w-16 />
    </div>
  </div>
</template>
