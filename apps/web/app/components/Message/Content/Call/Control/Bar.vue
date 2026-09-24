<!-- The call view's controls, centred under the stage with nothing drawn around them. A narrow screen that cannot fit them
     on one line gives them a second, still centred -->
<template>
  <div px-3 pb-3 flex shrink-0 flex-wrap gap-2 items-center justify-center>
    <MessageContentCallControlGroup />
    <MessageContentCallPictureInPictureButton />
    <MessageContentCallControlLeaveButton />
  </div>
</template>
