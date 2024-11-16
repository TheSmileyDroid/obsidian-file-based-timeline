import { Plugin } from "obsidian";
import { TimelineView } from "view";

interface FBTSettings {
	eventsFolder: string;
}

const DEFAULT_SETTINGS: FBTSettings = {
	eventsFolder: "Events",
};

export default class FBT extends Plugin {
	settings: FBTSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("calendar", "Open Timeline", () => {
			this.openTimelineView();
		});

		this.registerView(
			"timeline-view",
			(leaf) => new TimelineView(leaf, this)
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	openTimelineView() {
		this.app.workspace.getLeaf(true).setViewState({
			type: "timeline-view",
			active: true,
		});
	}
}
