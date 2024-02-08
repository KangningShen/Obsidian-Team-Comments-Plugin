import { ItemView, WorkspaceLeaf, MarkdownView, Editor, EditorPosition, TFile, Notice, } from 'obsidian';
import { createApp, App, toRaw } from 'vue';
import TeamCommentsTemplate from './TeamCommentsTemplate.vue';
import { TeamCommentsPlugin } from "./obsidianPlugin";
import { Comment } from './Comment';
import emitter from './emitter'

export const VIEW_TYPE: string = "team-comments";

export class TeamCommentsView extends ItemView {
    vueApp: App;
    plugin: TeamCommentsPlugin;
    //filePath: string | null = null;
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

    // if the text has already be selected, begin with '<mark class="team-comments", id=x>' and end with '</mark>', then extract id as textNum
    parseTextNumber(text: string): number {
        let textNum = 0;
        const regex = /<mark class="team-comments" id=(\d+)>[\s\S]*?<\/mark>/;
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
            // const view = this.app.workspace.getActiveViewOfType(MarkdownView);

            const content = this.vueApp.config.globalProperties.editor.getValue();
            const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
            const match = regex.exec(content);

            if (match && match[1]) {
                //console.log(match[1]);
                const parsedComments = JSON.parse(match[1])[textNum.toString()];
                console.log(parsedComments);
                if (parsedComments !== undefined)
                    return parsedComments;
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
                // const comments = <Comment[]>([{text_id: 2, publisher: '李四', time: '2024/1/28 01:33:01', content: '1', mentions: Array(0)}]);
                // https://github.com/renmu123/obsidian-api-faq?tab=readme-ov-file#%E8%8E%B7%E5%8F%96%E9%80%89%E4%B8%AD%E7%9A%84%E6%96%87%E5%AD%97
                this.vueApp = createApp(TeamCommentsTemplate);
                this.vueApp.config.globalProperties.plugin = this.plugin;
                this.vueApp.config.globalProperties.editor = activeView.editor;
                this.vueApp.config.globalProperties.cursorStart = activeView.editor.getCursor("from");
                this.vueApp.config.globalProperties.cursorEnd = activeView.editor.getCursor("to");
                this.vueApp.config.globalProperties.filePath = this.app.workspace.getActiveFile()?.path ?? "";
                console.log("filepath: " + this.vueApp.config.globalProperties.filePath);
                this.vueApp.config.globalProperties.container = mountPoint;

                this.vueApp.config.globalProperties.textNumber = this.parseTextNumber(selectedText);
                this.vueApp.config.globalProperties.comments = this.getComments(this.vueApp.config.globalProperties.textNumber);
                this.vueApp.mount(mountPoint);

                console.log(this.vueApp.config.globalProperties.cursorStart);
                console.log(this.vueApp.config.globalProperties.cursorEnd);
                // console.log(activeView.editor.getCursor("head"));
                // console.log(activeView.editor.getCursor("anchor"));

            }
        }

        emitter.on("submit-comment", async (data) => {
            // console.log("emitter!!!");

            const editor = this.vueApp.config.globalProperties.editor;
            //const content = editor.getValue();
            const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
            let match = regex.exec(editor.getValue());
            //console.log(match);
            if (!match || !match[1]) {
                editor.replaceRange("\n\n# Comments\n\`\`\`json\n"+JSON.stringify({})+"\n\`\`\`\n", { line: 9999, ch: 0 });
            }

            match = regex.exec(editor.getValue());
            // console.log(match);

            if (match && match[1])
            {
                let allComments = JSON.parse(match[1]);
                //console.log(allComments);

                if (this.vueApp.config.globalProperties.textNumber == 0)
                {

                    const max_text_id = Math.max.apply(null,Object.keys(allComments));
                    // console.log(max_text_id);
                    if (max_text_id == -Infinity)
                        this.vueApp.config.globalProperties.textNumber = 1;
                    else
                        this.vueApp.config.globalProperties.textNumber = max_text_id + 1;
                    data.text_id = this.vueApp.config.globalProperties.textNumber;
                    allComments[this.vueApp.config.globalProperties.textNumber.toString()] = <Comment[]>[];
                    
                    // let content = editor.getRange(this.vueApp.config.globalProperties.cursorStart, this.vueApp.config.globalProperties.cursorEnd);
                    // console.log(content);
                    // content = content.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    // console.log(content);
                    // editor.replaceRange(`<mark class="team-comments" id=${this.vueApp.config.globalProperties.textNumber}>` + content + "</mark>", this.vueApp.config.globalProperties.cursorStart, this.vueApp.config.globalProperties.cursorEnd);
                    
                    // console.log(this.vueApp.config.globalProperties.cursorEnd);
                    editor.replaceRange("</mark>", this.vueApp.config.globalProperties.cursorEnd);
                    // console.log(this.vueApp.config.globalProperties.cursorEnd);
                    // if (this.vueApp.config.globalProperties.cursorStart.line != this.vueApp.config.globalProperties.cursorEnd.line)
                    //     this.vueApp.config.globalProperties.cursorEnd.ch += 7;
                    // else
                    //     this.vueApp.config.globalProperties.cursorEnd.ch += 7;
                    // console.log(this.vueApp.config.globalProperties.cursorEnd);
                    editor.replaceRange(`<mark class="team-comments" id=${this.vueApp.config.globalProperties.textNumber}>`, this.vueApp.config.globalProperties.cursorStart);
                }
                //console.log(allComments);
                // if (!allComments.hasOwnProperty(this.vueApp.config.globalProperties.textNumber.toString()))
                //     allComments[this.vueApp.config.globalProperties.textNumber.toString()] = <Comment[]>[];
                allComments[this.vueApp.config.globalProperties.textNumber.toString()].unshift(data);
                //console.log(allComments);
                editor.replaceRange(JSON.stringify(allComments) + '\n', { line: editor.lastLine() - 2, ch: 0 }, { line: editor.lastLine() - 1, ch: 0 } );

                //this.vueApp.config.globalProperties.comments.unshift(data);
            
            }

            // console.log(editor.getCursor("from"));
            // console.log(editor.getCursor("to"));
        });


        
        emitter.on("delete-comment", (data) => {
            // console.log("emitter!!!");

            const editor = this.vueApp.config.globalProperties.editor;
            const regex = /# Comments\s*\`\`\`json\n([\s\S]*?)\`\`\`/;
            let match = regex.exec(editor.getValue());
            
            if (!match || !match[1]) {
                return;
            }

            if (match && match[1])
            {
                let allComments = JSON.parse(match[1]);
                if (!allComments.hasOwnProperty(this.vueApp.config.globalProperties.textNumber.toString()))
                    return ;
                
                allComments[this.vueApp.config.globalProperties.textNumber.toString()].splice(data, 1);

                if (allComments[this.vueApp.config.globalProperties.textNumber.toString()].length == 0)
                {
                    console.log("empty");
                    //delete allComments[this.vueApp.config.globalProperties.textNumber.toString()];

                }

                editor.replaceRange(JSON.stringify(allComments) + '\n', { line: editor.lastLine() - 2, ch: 0 }, { line: editor.lastLine() - 1, ch: 0 } );

            }
        });
    }


    // 在视图需要被关闭时调用，它负责释放视图占用的资源
    async onClose() {
        emitter.off("submit-comment");
        emitter.off("delete-comment");
        this.onunload();
    }
    onunload(): void {
        // console.log("onunload");
        this.vueApp.unmount();
    }

}
