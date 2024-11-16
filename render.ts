import * as _ from "lodash";
import { TFolder, type TFile } from "obsidian";
import TTRPGTimelinePlugin, {
	type CalendarConfig,
	type FBTSettings,
} from "./main";

interface FBTEvent {
	file: TFile;
	date: DateInfo;
}

interface DateInfo {
	hours: number;
	minutes: number;
	day: number;
	month: number;
	year: number;
}

function formatDate(
	date: DateInfo,
	format: string,
	config: CalendarConfig
): string {
	const year = date.year.toString();
	const month = (date.month + 1).toString().padStart(2, "0");
	const day = date.day.toString().padStart(2, "0");
	const hours = date.hours.toString().padStart(2, "0");
	const minutes = date.minutes.toString().padStart(2, "0");
	const monthName = config.months[date.month].name;
	let totalDays = date.year * config.yearLength + date.day - 1;
	for (let i = 0; i < date.month; i++) {
		totalDays += config.months[i].length;
	}
	const weekday = config.weekdays[totalDays % config.weekdays.length];
	console.log("weekday", weekday);
	return format.replace(/(\w+)/g, (match) => {
		switch (match) {
			case "yyyy":
				return year;
			case "yy":
				return year.slice(-2);
			case "MMMM":
				return monthName;
			case "MM":
				return month;
			case "dd":
				return day;
			case "HH":
				return hours;
			case "mm":
				return minutes;
			case "w":
				return weekday;
			case "W":
				return Math.floor(
					totalDays / config.weekdays.length
				).toString();
			case "G":
				return "AD";
			case "Y":
				return year;
			case "D":
				return totalDays.toString();
			case "F":
				return Math.ceil(date.day / 7).toString();
			case "E":
				return weekday;
			case "u":
				return ((totalDays % 7) + 1).toString();
			case "a":
				return date.hours >= 12 ? "PM" : "AM";
			case "k":
				return (date.hours === 0 ? 24 : date.hours)
					.toString()
					.padStart(2, "0");
			case "K":
				return (date.hours % 12).toString().padStart(2, "0");
			case "h":
				return (date.hours % 12 || 12).toString().padStart(2, "0");
			default:
				return match;
		}
	});
}

export async function renderTimeline(
	plugin: TTRPGTimelinePlugin,
	{ eventsFolder, calendarConfig, dateFormat }: FBTSettings,
	container: Element
) {
	const folder = plugin.app.vault.getAbstractFileByPath(eventsFolder);

	if (!(folder instanceof TFolder)) {
		container.createEl("p", {
			text: `Folder "${eventsFolder}" not found.`,
		});
		return;
	}

	const eventsFolderOnly = eventsFolder.endsWith("/")
		? eventsFolder
		: eventsFolder + "/";

	const files = plugin.app.vault
		.getMarkdownFiles()
		.filter((file) => file.path.startsWith(eventsFolderOnly));

	const events: FBTEvent[] = [];

	for (const file of files) {
		const metadata = plugin.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		const lowerCaseFrontmatter = _.mapKeys(frontmatter, (_, key) =>
			key.toLowerCase()
		);

		console.log(file);

		const day = lowerCaseFrontmatter["day"];
		const month = lowerCaseFrontmatter["month"];
		const year = lowerCaseFrontmatter["year"];
		const hour = lowerCaseFrontmatter["hour"];
		const minute = lowerCaseFrontmatter["minute"];

		events.push({
			file,
			date: {
				day: day ? parseInt(day) : 1,
				month: month ? parseInt(month) - 1 : 0,
				year: year ? parseInt(year) : 0,
				hours: hour ? parseInt(hour) : 0,
				minutes: minute ? parseInt(minute) : 0,
			},
		});
	}

	if (events.length === 0) {
		container.createEl("p", {
			text: `No events found in folder "${eventsFolder}".`,
		});
		return;
	}

	events.sort((a, b) => {
		if (a.date.year !== b.date.year) {
			return a.date.year - b.date.year;
		}
		if (a.date.month !== b.date.month) {
			return a.date.month - b.date.month;
		}
		if (a.date.day !== b.date.day) {
			return a.date.day - b.date.day;
		}
		if (a.date.hours !== b.date.hours) {
			return a.date.hours - b.date.hours;
		}
		if (a.date.minutes !== b.date.minutes) {
			return a.date.minutes - b.date.minutes;
		}

		return a.file.basename.localeCompare(b.file.basename);
	});

	const dates = events
		.map((event) => {
			return formatDate(event.date, dateFormat, calendarConfig);
		})
		.unique();

	dates.forEach((date) => {
		const dateEvents = events.filter((event) => {
			return formatDate(event.date, dateFormat, calendarConfig) === date;
		});
		const eventEl = container.createEl("div", {
			cls: "timeline-event",
		});

		eventEl.createEl("span", { text: date, cls: "timeline-date" });

		const eventList = eventEl.createEl("ul", { cls: "timeline-list" });

		dateEvents.forEach((event) => {
			const link = plugin.app.metadataCache.fileToLinktext(
				event.file,
				""
			);

			const listItem = eventList.createEl("li", { cls: "timeline-item" });

			const linkToFile = listItem.createEl("a", {
				text: event.file.basename,
				cls: "timeline-link",
			});

			linkToFile.onClickEvent((e) => {
				e.stopPropagation();
				e.preventDefault();
				plugin.app.workspace.openLinkText(link, "", true);
			});
		});
	});
}
