<script setup lang="tsx">
import { BlockElement } from "@/BlockElement";
import { exampleGraph } from "@/exampleGraph";
import { MockBlockDock } from "mock-block-dock";
import { defineComponent } from "vue";
import blockprotocol from "../blockprotocol.json";

const App = defineComponent(() => (
  <MockBlockDock
    blockDefinition={{
      customElement: {
        elementClass: BlockElement,
        tagName: blockprotocol.blockType.tagName,
      },
    }}
    blockEntityRecordId={exampleGraph.blockEntityRecordId}
    blockInfo={blockprotocol}
    debug // remove this to start with the debug UI minimised. You can also toggle it in the UI
    initialData={{
      initialEntities: exampleGraph.entities,
    }}
    includeDefaultMockData // this seeds the datastore with sample entities and links, remove this to start with just the contents of `initialData`
    simulateDatastoreLatency={{
      // configure this to adjust the range of artificial latency in responses to datastore-related requests (in ms)
      min: 50,
      max: 200,
    }}
    // hideDebugToggle <- uncomment this to disable the debug UI entirely
    // readonly <- uncomment this to start your block in readonly mode. You can also toggle it in the UI
  />
));
</script>

<template>
  <App />
</template>
