import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createApp, App } from 'vue';
import TeamCommentsTemplate from './TeamCommentsTemplate.vue';
import { TeamCommentsPlugin } from "./obsidianPlugin";

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

    async onOpen(this: TeamCommentsView) {
        const container = this.containerEl.children[1];
        container.empty();
        const mountPoint = container.createEl("div", {
            cls: "team-comments"
        });
        this.vueApp = createApp(TeamCommentsTemplate);
        this.vueApp.config.globalProperties.plugin = this.plugin;
        this.vueApp.config.globalProperties.container = mountPoint;
        this.vueApp.mount(mountPoint);
    }

    // 在视图需要被关闭时调用，它负责释放视图占用的资源
    async onClose() {
    }
    onunload(): void {
        this.vueApp.unmount();
    }

}
