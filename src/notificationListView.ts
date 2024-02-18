import { ItemView, WorkspaceLeaf, MarkdownView, Editor, EditorPosition, TFile, Notice, TextComponent, } from 'obsidian';
import NotificationListTemplate from './NotificationListTemplate.vue';
import { createApp, App } from 'vue';
import { TeamCommentsPlugin } from "./obsidianPlugin";
import { Comment, TextComment } from './Comment';
import emitter from './emitter';
import { text } from 'stream/consumers';


export const NOTIFICATION_VIEW_TYPE: string = "notification-list";

export class NotificationListView extends ItemView {
    vueApp: App;
    plugin: TeamCommentsPlugin;
    
    constructor(leaf: WorkspaceLeaf, plugin: TeamCommentsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return NOTIFICATION_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Notification List";
    }

    getIcon(): string {
        return "bell";
    }

    extractComments(content: string) : Record<string, Comment[]>{
        
        const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
        const match = regex.exec(content);

        if (match && match[1]) {
            const parsedComments = JSON.parse(match[1]);
            
            if (parsedComments !== undefined)
                return parsedComments;
        }
    
        return {};
    }

    extractText(content: string, text_id: string): [string, EditorPosition, EditorPosition] {
        const regex = new RegExp('<mark class="team-comments" id=' + text_id + '>([\\s\\S]*?)</mark>');
        const match = regex.exec(content);
        if (match && match[1]) 
        {
            const line_st = content.substring(0, match.index).split('\n').length - 1;
            const line_ed = line_st + match[1].split('\n').length - 1;
            const start: EditorPosition = { line: line_st, ch: match.index - content.lastIndexOf('\n', match.index - 1) - 1 };
            const end: EditorPosition = { line: line_ed, ch: match.index + match[0].length - content.lastIndexOf('\n', match.index + match[0].length) - 1};
            return [match[1], start, end];

        }
        return ["", {line: 0, ch: 0}, {line: 0, ch: 0}];
    }

    async getNotifications(): Promise<TextComment[]> {
        //const markdownFiles: TFile[] = this.app.vault.getMarkdownFiles();
        const notifications: TextComment[] = [];
        
        // this.app.vault.getMarkdownFiles().forEach(async (file: TFile) => {
        await Promise.all(this.app.vault.getMarkdownFiles().map(async (file: TFile) => {
            const file_content: string = await this.app.vault.cachedRead(file);

            const comments = this.extractComments(file_content);

              Object.entries(comments).forEach(
                ([key, value]) => {
                    for (let each_comment of value)
                    {
                        if (each_comment.mentions.includes(this.plugin.settings.name))
                        {
                            const [original_text, pos_st, pos_ed] = this.extractText(file_content, key);
                            notifications.push(<TextComment>{
                                file_path: file.path,
                                text_id: key,
                                original_text,
                                pos_st,
                                pos_ed,
                                ...each_comment,
                            });
                        }
                    }
                }
              );
        }));
        
        // Sort the comments array
        notifications.sort((a: TextComment, b: TextComment) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });
        
        return notifications;
    };

    refresh()
    {
        // console.log("refresh");
        this.vueApp.config.globalProperties.notifications = this.getNotifications();
        
    }

    async onOpen(this: NotificationListView) {
        const container = this.containerEl.children[1];
        container.empty();
        const mountPoint = container.createEl("div", {
            cls: "notification-list"
        });

        this.vueApp = createApp(NotificationListTemplate);
        this.vueApp.config.globalProperties.plugin = this.plugin;
        this.vueApp.config.globalProperties.notifications = await this.getNotifications();
        this.vueApp.config.globalProperties.container = mountPoint;
        this.vueApp.mount(mountPoint);
        
        emitter.on("open-comment", async (data) => {
            const file = this.app.vault.getAbstractFileByPath(data.file_path);
            if (file instanceof TFile) {
                await this.app.workspace.openLinkText(file.path, "", true);
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view instanceof MarkdownView) {
                    const editor = view.editor;
                    // Set the cursor position
                    editor.setSelection(data.pos_st, data.pos_ed);
                    // console.log(data.pos_st);
                    // console.log(data.pos_ed);
                    
                    // Scroll to the selected text
                    editor.scrollIntoView({from: data.pos_st, to: data.pos_ed}, true);
                }
            }
        });
    }


    async onClose() {
        emitter.off("open-comment");
        this.onunload();
    }
    onunload(): void {
        this.vueApp.unmount();
    }

}