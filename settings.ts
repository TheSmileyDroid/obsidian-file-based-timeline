import type FBT from "main";
import { PluginSettingTab, Setting, type App } from "obsidian";

export class FBTSettingTab extends PluginSettingTab {
	plugin: FBT;

	constructor(app: App, plugin: FBT) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Events Folder")
			.setDesc("Folder containing event files.")
			.addText((text) =>
				text
					.setPlaceholder("Events")
					.setValue(this.plugin.settings.eventsFolder)
					.onChange(async (value) => {
						this.plugin.settings.eventsFolder =
							value.trim() || "Events";
						await this.plugin.saveSettings();
					})
			);
	}
}
