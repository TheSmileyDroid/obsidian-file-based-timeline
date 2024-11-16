import type FBT from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";

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
		return "TTRPG Timeline";
	}

	async onOpen() {
		this.renderTimeline();
	}

	async onClose() {
		// Cleanup if necessary
	}

	async renderTimeline() {
		const { workspace, vault, metadataCache } = this.app;
		const folderPath = this.plugin.settings.eventsFolder;
		const files = vault
			.getMarkdownFiles()
			.filter((file) => file.path.startsWith(folderPath));

		const events = [];

		for (const file of files) {
			const metadata = metadataCache.getFileCache(file);
			const date = metadata?.frontmatter?.date;
			if (date) {
				events.push({ file, date: new Date(date) });
			}
		}

		events.sort((a, b) => a.date.getTime() - b.date.getTime());

		const container = this.containerEl.children[1];
		container.empty();

		events.forEach((event) => {
			const link = this.app.metadataCache.fileToLinktext(event.file, "");
			const dateStr = event.date.toDateString();

			const eventEl = container.createEl("div", {
				cls: "timeline-event",
			});
			eventEl.createEl("span", { text: dateStr, cls: "timeline-date" });
			eventEl.createEl("a", {
				text: link,
				href: event.file.path,
				cls: "timeline-link",
			});
		});
	}
}
