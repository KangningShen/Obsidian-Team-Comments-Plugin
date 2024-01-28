import { ItemView, WorkspaceLeaf, MarkdownView, Editor, EditorPosition, TFile, } from 'obsidian';
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

    // if the text has already be selected, begin with '<span class='team-comments', id=x>' and end with '</span>', then extract id as textNum
    parseTextNumber(text: string): number {
        let textNum = 0;
        const regex = /<span class='team-comments' id=(\d+)>[\s\S]*?<\/span>/;
        const match = regex.exec(text);
        if (match && match[1]) {
            textNum = parseInt(match[1], 10);
            console.log('match text');
        }
        console.log(textNum);
        return textNum;
    }

    getComments(textNum: number): Comment[] {
        let comments = <Comment[]> ([]);
        if (textNum == 0)
            return comments;
        else {
            // get 
            // get ## Text textNum
            // load all the comments stored under this section (before EOF or ## Text textNum+1)
            // string to json, saved in comments
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            //const currentFile: TFile | null = editor.file;

            if (view) {
                const content = view.editor.getValue();
                //const content = await this.app.vault.read(currentFile);
                const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
                //const regex = new RegExp(`# Text ${textNum}[\\s\\S]*?(?=## Text ${textNum + 1}|$)`);
                const match = regex.exec(content);

                if (match && match[1]) {
                    //console.log(match[1]);
                    const parsedComments = JSON.parse(match[1])[textNum.toString()];
                    console.log(parsedComments);
                    if (parsedComments !== undefined)
                        return parsedComments;
                    // console.log(parsedComments);
                    // if (parsedComments.hasOwnProperty(textNum.toString()))
                    //     comments = parsedComments[textNum.toString()]);
                    // console.log('comments:');
                    // console.log(comments);
                }
            }
        }
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
                // https://github.com/renmu123/obsidian-api-faq?tab=readme-ov-file#%E8%8E%B7%E5%8F%96%E9%80%89%E4%B8%AD%E7%9A%84%E6%96%87%E5%AD%97
                this.vueApp = createApp(TeamCommentsTemplate);
                this.vueApp.config.globalProperties.plugin = this.plugin;
                this.vueApp.config.globalProperties.textNumber = textNumber;
                this.vueApp.config.globalProperties.comments = comments;
                this.vueApp.config.globalProperties.editor = activeView.editor;
                this.vueApp.config.globalProperties.cursor_be = activeView.editor.getCursor('from');
                this.vueApp.config.globalProperties.cursor_ed = activeView.editor.getCursor('to');
                this.vueApp.config.globalProperties.container = mountPoint;
                this.vueApp.mount(mountPoint);

            }
        }

        emitter.on("submit-comment", async (data) => {
            console.log("emitter!!!");
            const editor = this.vueApp.config.globalProperties.editor;
            //const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            //const editor = this.getEditor()
            //console.log(view);
            //if (view) {
            const content = editor.getValue();
            const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
            let match = regex.exec(content);
            console.log(match);
            if (!match || !match[1]) {
                console.log("no");
                //editor.replaceSelection("# Comments\n\`\`\`json\n\`\`\`\n");
                editor.setCursor({ line: 9999, ch: 0 });
                editor.replaceRange("\n\n# Comments\n\`\`\`json\n\n\`\`\`\n", editor.getCursor());
                //editor.setCursor(this.vueApp.config.globalProperties.cursor_be, this.vueApp.config.globalProperties.cursor_ed);
                //editor.replaceRange("\n\n# Comments\n\`\`\`json\n\n\`\`\`\n", editor.getCursor('from'), editor.getCursor('to'));
            }
            
            // if (this.vueApp.config.globalProperties.textNumber == 0)
            // {
            //     this.vueApp.config.globalProperties.textNumber = 
            // }

            match = regex.exec(content);

            if (match && match[1])
            {
                let allComments = JSON.parse(match[1]);
                allComments[this.vueApp.config.globalProperties.textNumber.toString()].unshift(data);
                //editor.setCursor({ line: 9999, ch: 0 });
                //editor.setSelection(match[1]);
                editor.replaceSelection(JSON.stringify(allComments));
                //editor.replaceRange(JSON.stringify(allComments), editor.getCursor());
            }

            //}
            if (data.text_id == 0)
            {
                if (true /* unfinished: can't find # Comment */)
                {
                    // add # Comment at the end of the markdown document
                    // add Total text number: 0 at the end of the markdown document
                }
                // get Total text number: x, modify it to Total text number: x+1
                // the text_id of data is x+1
                // modify the selected text to assign html class 'team-comments' and id x+1
                // add ## Text x+1 at the end of the markdown document
            }
            // get the position of ## Text data.text_id
            // save comment as json below ## Text data.text_id
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
