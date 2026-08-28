import { spawnSync } from "node:child_process";
import {
	ensureThinkingPhraseSetting,
	getSettingsPath,
} from "./lib/vscode-settings.mts";

const settingsPath = process.env.VSCODE_SETTINGS_PATH ?? getSettingsPath();
ensureThinkingPhraseSetting(settingsPath);

const buildResult = spawnSync(process.execPath, ["scripts/build.mts"], {
	stdio: "inherit",
});

if (buildResult.error || buildResult.status !== 0) {
	process.exitCode = buildResult.status ?? 1;
	throw buildResult.error ?? new Error("Failed to build phrases.json");
}

const result = spawnSync(
	process.execPath,
	[
		"scripts/merge.mts",
		"--target",
		settingsPath,
		"--property",
		"chat.agent.thinking.phrases.phrases",
		"--write",
	],
	{ stdio: "inherit" },
);

if (result.error) {
	throw result.error;
}

process.exitCode = result.status ?? 1;
