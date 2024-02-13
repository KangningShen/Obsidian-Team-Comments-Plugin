<template>
    <NConfigProvider :theme="theme">
        <NList hoverable bordered show-divider>
          <template #header>
            Notifications for "{{ plugin.settings.name }}":
          </template>
          <template #footer>
            Total notifications: {{notifications.length}}
          </template>
          <NListItem v-for="textcomment in notifications" >
            <NThing v-bind:title="textcomment.file_path" v-bind:title-extra="`Line: ${textcomment.pos_st.line} - ${textcomment.pos_ed.line}`" style="margin-top: 1px; white-space: pre-wrap;" content-style="margin-top: 1px;" >
              <template #description>
                <NAnchor>
                  <NFlex wrap style="margin: 5px; white-space: pre-wrap;">{{textcomment.original_text}}</NFlex>
                </NAnchor>
              </template>
              <NThing v-bind:title="textcomment.publisher" v-bind:title-extra="textcomment.time" style="margin-top: 1px" content-style="margin-top: 1px" >
                <NTag v-for="mention in textcomment.mentions" :bordered="false" type="info" size="small" style="margin: 3px">
                  @{{ mention }}
                </NTag>
                <NFlex wrap style="margin-top: 5px; white-space: pre-wrap;">{{ textcomment.content }}</NFlex>
              </NThing>
            </NThing>
              <template #suffix>
                <NButton @click="openTextComment(textcomment)">Open</NButton>
              </template>
          </NListItem>
        </NList>
      </NConfigProvider> 
</template>

<style scoped>
[NThing] .naive-thing__title-extra {
  font-weight: bold;
}
</style>

<script setup lang="ts">
  import { ref, getCurrentInstance } from 'vue';
  import { darkTheme, NAnchor, NAnchorLink, NDivider, NFlex, NButton, NConfigProvider, NList, NListItem, NThing, NTag } from 'naive-ui';
  import { TextComment } from './Comment';
  import { TeamCommentsPlugin } from "./obsidianPlugin";
  import emitter from './emitter'

  let componentSelf = getCurrentInstance();
  if (!componentSelf) throw Error("vue not found");
  let plugin = componentSelf.appContext.config.globalProperties.plugin as TeamCommentsPlugin
  let global = componentSelf.appContext.config.globalProperties;

  const theme = ref(document.body.classList.contains('theme-dark') ? darkTheme : undefined);
  const notifications = ref<TextComment[]>(global.notifications);
  //console.log(notifications.value);

  function openTextComment (textcomment: TextComment){
    emitter.emit("open-comment", textcomment);
  }
</script>

