import * as _ from "lodash";
import { Plugin } from "obsidian";
import { renderTimeline } from "render";
import { FBTSettingTab } from "settings";
import { TimelineView } from "view";

export interface CalendarConfig {
	months: Month[];
	weekdays: string[];
	yearLength: number;
}

export interface Month {
	name: string;
	length: number;
}

export interface FBTSettings {
	eventsFolder: string;
	calendarConfig: CalendarConfig;
	dateFormat: string;
}

const DEFAULT_SETTINGS: FBTSettings = {
	eventsFolder: "Events",
	calendarConfig: {
		months: [
			{ name: "January", length: 31 },
			{ name: "February", length: 28 },
			{ name: "March", length: 31 },
			{ name: "April", length: 30 },
			{ name: "May", length: 31 },
			{ name: "June", length: 30 },
			{ name: "July", length: 31 },
			{ name: "August", length: 31 },
			{ name: "September", length: 30 },
			{ name: "October", length: 31 },
			{ name: "November", length: 30 },
			{ name: "December", length: 31 },
		],
		weekdays: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		],
		yearLength: 365,
	},

	dateFormat: "yyyy-MM-dd",
};

export default class FBT extends Plugin {
	settings: FBTSettings;
	defaultSettings: FBTSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new FBTSettingTab(this.app, this));

		this.addRibbonIcon("calendar", "Open Timeline", () => {
			this.openTimelineView();
		});

		this.registerView(
			"timeline-view",
			(leaf) => new TimelineView(leaf, this)
		);

		this.registerMarkdownCodeBlockProcessor(
			"fbtimeline",
			async (source, el, ctx) => {
				const lines = _.map(source.trim().split("\n"), (line) =>
					line.trim()
				);
				const eventsFolder =
					_.find(lines, (line) => line.startsWith("folder:"))
						?.split(":")[1]
						.trim() || this.settings.eventsFolder;

				const dateFormat =
					_.find(lines, (line) => line.startsWith("date:"))
						?.split(":")[1]
						.trim() || this.settings.dateFormat;

				const hasMonthsConfigured =
					_.filter(lines, (line) => line.startsWith("month:"))
						.length > 0;
				const configuredMonths = _.map(
					_.filter(lines, (line) => line.startsWith("month:")),
					(line) => {
						const parts = line.split(":")[1].split(",");
						return {
							name: parts[0].trim(),
							length: parseInt(parts[1].trim()),
						};
					}
				);
				const calendarConfig = {
					months: hasMonthsConfigured
						? configuredMonths
						: this.settings.calendarConfig.months,
					weekdays: _.map(
						_.filter(lines, (line) => line.startsWith("weekday:")),
						(line) => line.split(":")[1].trim()
					),
					yearLength: parseInt(
						_.find(lines, (line) => line.startsWith("year:"))
							?.split(":")[1]
							.trim() ||
							this.settings.calendarConfig.yearLength.toString()
					),
				};

				el.classList.add("timeline");

				await renderTimeline(
					this,
					{ eventsFolder, calendarConfig, dateFormat },
					el
				);
			}
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
