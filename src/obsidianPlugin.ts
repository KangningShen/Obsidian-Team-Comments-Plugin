import { Notice, Editor, EditorPosition, HoverPopover, MarkdownFileInfo, MarkdownView, Plugin, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, TeamCommentsSettingTab, TeamCommentsSettings } from "./obsidianSettings";
import { TeamCommentsView, VIEW_TYPE } from './teamCommentsView';
import { NotificationListView, NOTIFICATION_VIEW_TYPE} from './notificationListView'

export class TeamCommentsPlugin extends Plugin {
	settings: TeamCommentsSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE,
			(leaf) => new TeamCommentsView(leaf, this)
		);

		this.registerView(
			NOTIFICATION_VIEW_TYPE,
			(leaf) => new NotificationListView(leaf, this)
		);
        

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TeamCommentsSettingTab(this.app, this));

		this.registerCommands();
		//this.registerEvent();
		this.registerListener();
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
			editorCallback: (editor: Editor) => {
				this.activateView();
			}
		});
		this.addCommand({
			id: "open-notification-list",
			name: "Open Notification List",
			callback: () => {
				this.openNotificationList();
			}
		});
	}

	registerListener() {
		this.registerEvent(this.app.workspace.on('file-open', async (file: TFile) => {
			const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
			if (existingLeaves.length > 0)
			{
				const existingView = existingLeaves[0].view as TeamCommentsView;
				existingView.onClose();
				this.app.workspace.detachLeavesOfType(VIEW_TYPE);
				return;
			}
		}));
	}

	// https://docs.obsidian.md/Plugins/User+interface/Commands#Editor+commands
	async activateView() {

		const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
		if (existingLeaves.length > 0)
		{
			const existingView = existingLeaves[0].view as TeamCommentsView;
			//await existingView.refresh();
			existingView.onClose();
			existingView.onOpen();
			this.app.workspace.setActiveLeaf(existingLeaves[0]);
			return;
		}

		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		if (activeView) {
			const selectedText = activeView.editor.getSelection();
		
			if (selectedText) {
				
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
	  
	async openNotificationList() {
		if (this.settings.name == "")
		{
			new Notice('Set your name before open notification list. ');
			return;
		}
		const existingLeaves = this.app.workspace.getLeavesOfType(NOTIFICATION_VIEW_TYPE);
		if (existingLeaves.length > 0)
		{
			const existingView = existingLeaves[0].view as NotificationListView;
			//await existingView.refresh();
			existingView.onClose();
			existingView.onOpen();
			//existingView.refresh();
			this.app.workspace.setActiveLeaf(existingLeaves[0]);
			return;
		}

		const leaf = this.app.workspace.getLeaf(false);
		if (leaf)
		{
			await leaf.setViewState({
				type: NOTIFICATION_VIEW_TYPE,
				active: true,
			});
		}
		else
		{
			new Notice('Failed to open notification list. ');
		}
	}
}