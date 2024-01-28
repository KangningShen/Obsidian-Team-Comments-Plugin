<template>
    <NConfigProvider :theme="theme">
      <NSpace vertical>
        <NInput v-model:value="newComment" placeholder="Type your comment..." type="textarea" size="small" :autosize="{minRows: 3}"/>
        <NFlex wrap>Mention: 
        <NMention :options="options" default-value="@" v-model:value="mentionsInput" />
        </NFlex>
        <NButton @click="submitComment">Submit</NButton>
      </NSpace>
      <NList hoverable clickable>
        <NListItem v-for="comment in global.comments" :key="comment.text_id + '-' + comment.content">
          <NThing v-bind:title="comment.publisher" v-bind:title-extra="comment.time" style="margin-top: 1px;" content-style="margin-top: 1px;">
            <NTag v-for="mention in comment.mentions" :bordered="false" type="info" size="small" style="margin: 3px">
              @{{ mention }}
            </NTag>
            <NFlex wrap style="margin-top: 5px; white-space: pre-wrap;">{{ comment.content }}</NFlex>
          </NThing>
        </NListItem>
      </NList>
    </NConfigProvider>
</template>
  
<script setup lang="ts">
  import { ref, getCurrentInstance } from 'vue';
  import { darkTheme, NFlex, NButton, NConfigProvider, NInput, NList, NListItem, NThing, NTag, NSpace, NMention, MentionOption } from 'naive-ui';
  import { Comment } from './Comment';
  import { TeamCommentsPlugin } from "./obsidianPlugin";
  import emitter from './emitter'

  interface Props{
    comments: Comment[];
  }
  

  const options = ref<MentionOption[]>([]);
  let componentSelf = getCurrentInstance();
  if (!componentSelf) throw Error("vue not found");
  let plugin = componentSelf.appContext.config.globalProperties.plugin as TeamCommentsPlugin
  options.value = plugin.settings.mentions;

  let global = componentSelf.appContext.config.globalProperties;
  
  const newComment = ref<string>('');
  const comments = ref<Comment[]>(global.comments);
  const mentionsInput = ref('@');
  const theme = ref(document.body.classList.contains('theme-dark') ? darkTheme : undefined);

  // const emit = defineEmits(['submit-comment'])

  // comments = defineProps(['comments']);
  function submitComment (){
    if (newComment.value.trim() !== '') {
        const timestamp = new Date().toLocaleString();
        const userMentions = mentionsInput.value.replace(/\s/g, "").split('@').filter(i => i && i.trim());
        const comment = <Comment>{
            //file_path: "./",
            text_id: global.textNumber, // Replace with actual text id
            publisher: plugin.settings.name,
            time: timestamp,
            content: newComment.value,
            mentions: userMentions
        };
        //plugin.$
        //emit('submit-comment', {comment})
        //if (!componentSelf) throw Error("vue not found");
        //componentSelf.$EventBus.emit('newTask', comment);
        //this.$bus.$emit('click', comment);
        emitter.emit("submit-comment", comment);
        userMentions.forEach(userMention => {
            if (!options.value.some(opt => opt.value === userMention)) {
                options.value.push({
                    label: userMention,
                    value: userMention
                });
            }
        });
        console.log(comment);
        plugin.settings.mentions = options.value;
        plugin.saveSettings();
        comments.value.unshift(comment);
        newComment.value = ''; // Clear the input field
        mentionsInput.value = '@'; // Clear the mention field
    }
  };
</script>