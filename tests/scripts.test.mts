import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse as parseJsonc } from "jsonc-parser";
import type { PhrasesDocument } from "../scripts/types.mts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function withTempDir(run: (dir: string) => Promise<void>): Promise<void> {
	const dir = await mkdtemp(join(tmpdir(), "agent-thinking-phrases-"));
	try {
		await run(dir);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

function runNode(
	scriptRelativePath: string,
	args: string[],
	env: NodeJS.ProcessEnv = {},
): string {
	return execFileSync(process.execPath, [scriptRelativePath, ...args], {
		cwd: projectRoot,
		env: { ...process.env, ...env },
		encoding: "utf8",
	});
}

async function readSourcePhrases(): Promise<string[]> {
	const document = JSON.parse(
		await readFile(resolve(projectRoot, "phrases.json"), "utf8"),
	) as PhrasesDocument;
	return document.phrases;
}

test("build combines all phrases/*.jsonc files into phrases.json", async () => {
	runNode("scripts/build.mts", []);
	const document = JSON.parse(
		await readFile(resolve(projectRoot, "phrases.json"), "utf8"),
	) as PhrasesDocument;

	assert.ok(Array.isArray(document.phrases));
	assert.ok(document.phrases.length > 0);
	assert.ok(document.phrases.every((phrase) => typeof phrase === "string"));
});

test("merge appends only new phrases into a scratch settings file", async () => {
	await withTempDir(async (dir) => {
		const targetPath = join(dir, "settings.json");
		const outputPath = join(dir, "settings.merged.json");
		await writeFile(
			targetPath,
			JSON.stringify({
				"chat.agent.thinking.phrases": {
					mode: "append",
					phrases: ["existing phrase"],
				},
			}),
		);

		runNode("scripts/merge.mts", [
			"--target",
			targetPath,
			"--property",
			"chat.agent.thinking.phrases.phrases",
			"--output",
			outputPath,
		]);

		const merged = JSON.parse(await readFile(outputPath, "utf8"));
		const sourcePhrases = await readSourcePhrases();

		assert.equal(merged["chat.agent.thinking.phrases"].mode, "append");
		assert.ok(
			merged["chat.agent.thinking.phrases"].phrases.includes("existing phrase"),
		);
		assert.equal(
			merged["chat.agent.thinking.phrases"].phrases.length,
			sourcePhrases.length + 1,
		);
	});
});

test("replace overwrites the target phrase array with the source array exactly", async () => {
	await withTempDir(async (dir) => {
		const targetPath = join(dir, "settings.json");
		const outputPath = join(dir, "settings.replaced.json");
		await writeFile(
			targetPath,
			JSON.stringify({
				"chat.agent.thinking.phrases": {
					mode: "append",
					phrases: ["stale one", "stale two"],
				},
			}),
		);

		runNode("scripts/replace.mts", [
			"--target",
			targetPath,
			"--property",
			"chat.agent.thinking.phrases.phrases",
			"--output",
			outputPath,
		]);

		const replaced = JSON.parse(await readFile(outputPath, "utf8"));
		const sourcePhrases = await readSourcePhrases();

		assert.equal(replaced["chat.agent.thinking.phrases"].mode, "append");
		assert.deepEqual(
			replaced["chat.agent.thinking.phrases"].phrases,
			sourcePhrases,
		);
	});
});

test("merge:vscode rebuilds phrases.json and merges into a scratch VS Code settings file", async () => {
	await withTempDir(async (dir) => {
		const settingsPath = join(dir, "settings.json");
		await writeFile(settingsPath, JSON.stringify({}));

		runNode("scripts/merge-vscode.mts", [], {
			VSCODE_SETTINGS_PATH: settingsPath,
		});

		const settings = JSON.parse(await readFile(settingsPath, "utf8"));
		const sourcePhrases = await readSourcePhrases();

		assert.equal(settings["chat.agent.thinking.phrases"].mode, "append");
		assert.equal(
			settings["chat.agent.thinking.phrases"].phrases.length,
			sourcePhrases.length,
		);
	});
});

test("replace:vscode rebuilds phrases.json and replaces a scratch VS Code settings file's phrases", async () => {
	await withTempDir(async (dir) => {
		const settingsPath = join(dir, "settings.json");
		await writeFile(
			settingsPath,
			JSON.stringify({
				"chat.agent.thinking.phrases": {
					mode: "append",
					phrases: ["stale phrase"],
				},
			}),
		);

		runNode("scripts/replace-vscode.mts", [], {
			VSCODE_SETTINGS_PATH: settingsPath,
		});

		const settings = JSON.parse(await readFile(settingsPath, "utf8"));
		const sourcePhrases = await readSourcePhrases();

		assert.deepEqual(
			settings["chat.agent.thinking.phrases"].phrases,
			sourcePhrases,
		);
	});
});

test("sort-phrases sorts each phrases/*.jsonc file alphabetically", async () => {
	await withTempDir(async (dir) => {
		const phrasesDir = join(dir, "phrases");
		await mkdir(phrasesDir);
		await writeFile(
			join(phrasesDir, "sample.jsonc"),
			'{\n\t// Sample theme\n\t"phrases": [\n\t\t"Zebra...",\n\t\t"Apple..."\n\t]\n}\n',
		);

		runNode("scripts/sort-phrases.mts", [], { PHRASES_DIR: phrasesDir });

		const document = parseJsonc(
			await readFile(join(phrasesDir, "sample.jsonc"), "utf8"),
		) as PhrasesDocument;
		assert.deepEqual(document.phrases, ["Apple...", "Zebra..."]);
	});
});
