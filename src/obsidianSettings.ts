import { App, PluginSettingTab, Setting } from 'obsidian';
import { TeamCommentsPlugin } from "./obsidianPlugin";
import { MentionOption } from 'naive-ui';

export interface TeamCommentsSettings {
    name: string;
    mentions: MentionOption[];
  }

export const DEFAULT_SETTINGS: TeamCommentsSettings = {
    name: 'default',
    mentions: [],
}

export class TeamCommentsSettingTab extends PluginSettingTab {
    plugin: TeamCommentsPlugin;

    constructor(app: App, plugin: TeamCommentsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Settings for Team Comments plugin.' });

        new Setting(containerEl)
            .setName('Your name: ')
            .setDesc('Your name will be displayed in your comments.')
			.addText(text => text
				.setPlaceholder('Enter your name')
				.setValue(this.plugin.settings.name)
				.onChange(async (value) => {
					this.plugin.settings.name = value;
					await this.plugin.saveSettings();
				}));
    }
}