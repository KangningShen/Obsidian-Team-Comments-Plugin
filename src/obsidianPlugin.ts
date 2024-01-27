import { Notice, Editor, EditorPosition, HoverPopover, MarkdownFileInfo, MarkdownView, Plugin, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, TeamCommentsSettingTab, TeamCommentsSettings } from "./obsidianSettings";
import { TeamCommentsView, VIEW_TYPE } from './obsidianView';

export class TeamCommentsPlugin extends Plugin {
	settings: TeamCommentsSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE,
			(leaf) => new TeamCommentsView(leaf, this)
		);
        

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TeamCommentsSettingTab(this.app, this));

		this.registerCommands();
    }
    
	async onunload() {

		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
	}

    
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	registerCommands() {
		this.addCommand({
			id: "open-comments-panel",
			name: "Open Comments Panel",
			callback: () => {
				this.activateView();
			}
		});
	}

	async activateView() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (activeView) {
			const selectedText = activeView.editor.getSelection();
		
			if (selectedText) {
				this.app.workspace.detachLeavesOfType(VIEW_TYPE);
				
				await this.app.workspace.getRightLeaf(false).setViewState({
					type: VIEW_TYPE,
					active: true,
				});
		
				this.app.workspace.revealLeaf(
					this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]
				);
			} 
			else {
				new Notice('Please select some text before opening the comments panel.');
			}
		} 
		else {
			new Notice('Please open a Markdown document before opening the comments panel.');
		}
	}
	  
	  
}