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

		new Setting(containerEl)
			.setName("Date Format")
			.setDesc("Date format for events.")
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat =
							value.trim() || "YYYY-MM-DD";
						await this.plugin.saveSettings();
					})
			);

		const calendarConfig = this.plugin.settings.calendarConfig;
		const months = calendarConfig.months.map((month) => month.name);
		const weekdays = calendarConfig.weekdays;

		new Setting(containerEl)
			.setName("Month names and lengths")
			.setDesc("List of months and their lengths.")
			.addTextArea((text) =>
				text
					.setPlaceholder("January,31")
					.setValue(
						months
							.map(
								(month, i) =>
									`${month},${calendarConfig.months[i].length}`
							)
							.join("\n")
					)
					.onChange(async (value) => {
						this.plugin.settings.calendarConfig.months = value
							.split("\n")
							.map((line) => {
								const parts = line.split(",");
								return {
									name: parts[0].trim(),
									length: parseInt(parts[1].trim()),
								};
							});
						console.log(this.plugin.settings.calendarConfig.months);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Weekdays")
			.setDesc("List of weekdays.")
			.addTextArea((text) =>
				text
					.setPlaceholder("Monday")
					.setValue(weekdays.join("\n"))
					.onChange(async (value) => {
						this.plugin.settings.calendarConfig.weekdays = value
							.split("\n")
							.map((line) => line.trim());
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Year Length")
			.setDesc("Number of days in a year.")
			.addText((text) =>
				text
					.setPlaceholder("365")
					.setValue(calendarConfig.yearLength.toString())
					.onChange(async (value) => {
						this.plugin.settings.calendarConfig.yearLength =
							parseInt(value.trim()) || 365;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Reset Settings")
			.setDesc("Reset all settings to default.")
			.addButton((button) =>
				button.setButtonText("Reset").onClick(async () => {
					this.plugin.settings = Object.assign(
						{},
						this.plugin.defaultSettings
					);
					await this.plugin.saveSettings();
					this.display();
				})
			);

		new Setting(containerEl)
			.setName("Export Settings")
			.setDesc("Export settings to JSON.")
			.addButton((button) =>
				button.setButtonText("Export").onClick(async () => {
					const settings = JSON.stringify(
						this.plugin.settings,
						null,
						2
					);
					const blob = new Blob([settings], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = "fbt-settings.json";
					a.click();
					URL.revokeObjectURL(url);
				})
			);

		new Setting(containerEl)
			.setName("Import Settings")
			.setDesc("Import settings from JSON.")
			.addText((text) =>
				text
					.setPlaceholder("Paste settings here.")
					.onChange(async (value) => {
						try {
							const settings = JSON.parse(value);
							this.plugin.settings = settings;
							await this.plugin.saveSettings();
							this.display();
						} catch (e) {
							console.error(e);
						}
					})
			);
	}
}
