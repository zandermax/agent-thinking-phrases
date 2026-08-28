import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";

const settingsPath = process.env.VSCODE_SETTINGS_PATH ?? getSettingsPath();
ensureThinkingPhraseSetting(settingsPath);

const buildResult = spawnSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });

if (buildResult.error || buildResult.status !== 0) {
    process.exitCode = buildResult.status ?? 1;
    throw buildResult.error ?? new Error("Failed to build phrases.json");
}

const result = spawnSync(
    process.execPath,
    [
        "scripts/replace.mjs",
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

function getSettingsPath() {
    if (process.platform === "darwin") {
        return join(process.env.HOME, "Library/Application Support/Code/User/settings.json");
    }

    if (process.platform === "win32") {
        return join(process.env.APPDATA, "Code/User/settings.json");
    }

    return join(process.env.XDG_CONFIG_HOME ?? join(process.env.HOME, ".config"), "Code/User/settings.json");
}

function ensureThinkingPhraseSetting(path) {
    const settings = readFileSync(path, "utf8");
    const errors = [];
    const document = parse(settings, errors, { allowTrailingComma: true });

    if (errors.length > 0) {
        const details = errors.map((error) => printParseErrorCode(error.error)).join(", ");
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