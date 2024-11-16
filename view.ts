import type FBT from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { renderTimeline } from "render";

export class TimelineView extends ItemView {
	plugin: FBT;

	constructor(leaf: WorkspaceLeaf, plugin: FBT) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return "timeline-view";
	}

	getDisplayText() {
		return "File Based Timeline";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		await renderTimeline(
			this.plugin,
			{
				eventsFolder: this.plugin.settings.eventsFolder,
				dateFormat: this.plugin.settings.dateFormat,
				calendarConfig: this.plugin.settings.calendarConfig,
			},
			container
		);
	}

	async onClose() {
		// Cleanup if necessary
	}
}
