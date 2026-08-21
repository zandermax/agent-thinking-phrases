import { spawnSync } from "node:child_process";
import { join } from "node:path";

const settingsPath = getSettingsPath();
const result = spawnSync(
    process.execPath,
    [
        "scripts/merge.mjs",
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