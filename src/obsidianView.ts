import { ItemView, WorkspaceLeaf, MarkdownView, Editor, EditorPosition, } from 'obsidian';
import { createApp, App } from 'vue';
import TeamCommentsTemplate from './TeamCommentsTemplate.vue';
import { TeamCommentsPlugin } from "./obsidianPlugin";
import { Comment } from './Comment';
import emitter from './emitter'

export const VIEW_TYPE: string = 'team-comments';

export class TeamCommentsView extends ItemView {
    vueApp: App;
    plugin: TeamCommentsPlugin;
    constructor(leaf: WorkspaceLeaf, plugin: TeamCommentsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    // 用于返回当前视图的唯一标识
    getViewType(): string {
        return VIEW_TYPE;
    }

    // 用于返回一个更加人性化的视图名称
    getDisplayText(): string {
        return "Team Comments";
    }

    getIcon(): string {
        return "lines-of-text";
    }
    
    parseTextNumber(text: string): number {
        let textNum = 0;
        // unfinished
        
        return textNum;
    }

    getComments(textNum: number): Comment[] {
        let comments = <Comment[]> ([]);
        if (textNum == 0)
            return comments;
        // else load comments
        return comments;
    }

    async onOpen(this: TeamCommentsView) {
        const container = this.containerEl.children[1];
        container.empty();
        const mountPoint = container.createEl("div", {
            cls: "team-comments"
        });

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        if (activeView) {
			const selectedText = activeView.editor.getSelection();

            if (selectedText)
            {
                const textNumber = this.parseTextNumber(selectedText);
                const comments = this.getComments(textNumber);
                // const comments = <Comment[]>([{text_id: 2, publisher: '李四', time: '2024/1/28 01:33:01', content: '1', mentions: Array(0)}]);
                
                this.vueApp = createApp(TeamCommentsTemplate);
                this.vueApp.config.globalProperties.plugin = this.plugin;
                this.vueApp.config.globalProperties.textNumber = textNumber;
                this.vueApp.config.globalProperties.comments = comments;
                this.vueApp.config.globalProperties.container = mountPoint;
                this.vueApp.mount(mountPoint);

            }
        }

        emitter.on("submit-comment", async (data) => {
            console.log("emitter!!!");
            if (data.text_id == 0)
            {
                if (1)//找不到# Comment
                {
                    // 分 Comment节
                }
                // 分id + id节，高亮代码
            }
            // save comment
        });

        // const commentsData: Comment[] = [];
    }


    // 在视图需要被关闭时调用，它负责释放视图占用的资源
    async onClose() {
    }
    onunload(): void {
        this.vueApp.unmount();
    }

}
