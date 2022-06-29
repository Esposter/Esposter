<script setup lang="ts">
const panel = [2];
const password = "Password";
const show = false;
const message = "Type a message here";
const marker = true;
const iconIndex = 0;
const sendMessage = () => {};
const clearMessage = () => {};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-badge bordered bottom color="green" dot offset-x="11" offset-y="13">
          <v-avatar class="mt-n7" size="40" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/1.jpg" />
          </v-avatar>
        </v-badge>
        <v-toolbar-title class="title pl-0 ml-2 mt-n4"> Fernando Gaucho </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title class="title pl-0 mr-2 mt-n4"> Members : </v-toolbar-title>
        <v-btn color="blue" icon class="mt-n5 mr-n2" outlined max-height="35" max-width="35">
          <v-icon small>mdi-cog</v-icon>
        </v-btn>
        <v-avatar class="mt-n5 mr-2" size="30" elevation="10">
          <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg" />
        </v-avatar>
        <v-divider vertical inset class="mt-n1"></v-divider>
        <v-btn color="black" icon class="mt-n5">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-card class="mt-10 mr-2" max-width="350px" color="blue" dark>
          <v-list-item three-line>
            <div class="mb-4">Good morning. How are you today?</div>
            <v-list-item-subtitle>16 mins ago <span class="ml-16">Seen 1:03PM</span></v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-badge bordered bottom color="green" dot offset-x="10" offset-y="10">
          <v-avatar class="mt-n5" size="30" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg" />
          </v-avatar>
        </v-badge>
        <v-badge bordered bottom color="green" dot offset-x="16" offset-y="9">
          <v-avatar class="mt-n5 mr-2" size="30" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/1.jpg" />
          </v-avatar>
        </v-badge>
        <v-card class="mt-10" max-width="350px">
          <v-list-item three-line>
            <div class="mb-4">Hey! Very good.I'm taking a photos in the office</div>
            <v-list-item-subtitle>12 mins ago</v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-btn color="black" icon class="mb-n10">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
        <v-badge bordered bottom color="green" dot offset-x="10" offset-y="10">
          <v-avatar class="mt-n5" size="30" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/1.jpg" />
          </v-avatar>
        </v-badge>
        <v-card class="mt-10 ml-2" max-width="350px">
          <v-list-item three-line>
            <div class="mb-4">
              Fernando shared 3 photos :<br /><br />
              <v-avatar size="60" tile class="mr-2">
                <v-img src="1.jpg"></v-img>
              </v-avatar>
              <v-avatar size="60" tile class="mr-2">
                <v-img src="2.jpg"></v-img>
              </v-avatar>
              <v-avatar size="60" tile>
                <v-img src="3.jpg"></v-img>
              </v-avatar>
            </div>

            <v-list-item-subtitle>12 mins ago</v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-spacer></v-spacer>
        <v-card class="mt-10 mr-2" max-width="350px" color="blue" dark>
          <v-list-item three-line>
            <div class="mb-4">There many variations of passages of Loream</div>
            <v-list-item-subtitle>2 mins ago <span class="ml-16">Seen 1:23PM</span></v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-badge bordered bottom color="green" dot offset-x="10" offset-y="10">
          <v-avatar class="mt-n5" size="30" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg" />
          </v-avatar>
        </v-badge>
        <v-spacer></v-spacer>
        <v-card class="mt-10 mr-2" max-width="350px" color="blue" dark>
          <v-list-item three-line>
            <div class="mb-4">God by !!!!!!!!!!!!!!</div>
            <v-list-item-subtitle>3 mins ago <span class="ml-16">Seen 1:24PM</span></v-list-item-subtitle>
          </v-list-item>
        </v-card>
        <v-badge bordered bottom color="green" dot offset-x="10" offset-y="10">
          <v-avatar class="mt-n5" size="30" elevation="10">
            <img src="https://cdn.vuetifyjs.com/images/lists/5.jpg" />
          </v-avatar>
        </v-badge>
        <v-text-field
          v-model="message"
          append-icon="mdi-emoticon"
          :append-outer-icon="message ? 'mdi-send' : 'mdi-microphone'"
          filled
          clear-icon="mdi-close-circle"
          clearable
          label="Message"
          type="text"
          @click:append-outer="sendMessage"
          @click:clear="clearMessage"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>
