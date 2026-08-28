import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";

export function getSettingsPath(): string {
	if (process.platform === "darwin") {
		return join(
			process.env.HOME as string,
			"Library/Application Support/Code/User/settings.json",
		);
	}

	if (process.platform === "win32") {
		return join(process.env.APPDATA as string, "Code/User/settings.json");
	}

	return join(
		process.env.XDG_CONFIG_HOME ?? join(process.env.HOME as string, ".config"),
		"Code/User/settings.json",
	);
}

export function ensureThinkingPhraseSetting(path: string): void {
	const settings = readFileSync(path, "utf8");
	const errors: Parameters<typeof parse>[1] = [];
	const document = parse(settings, errors, { allowTrailingComma: true });

	if (errors.length > 0) {
		const details = errors
			.map((error) => printParseErrorCode(error.error))
			.join(", ");
		throw new Error(`Could not parse ${path}: ${details}`);
	}

	if (document?.["chat.agent.thinking.phrases"] !== undefined) {
		return;
	}

	const edits = modify(
		settings,
		["chat.agent.thinking.phrases"],
		{ mode: "append", phrases: [] },
		{ formattingOptions: { insertSpaces: true, tabSize: 4 } },
	);

	writeFileSync(path, applyEdits(settings, edits));
}
