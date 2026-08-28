import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, printParseErrorCode } from "jsonc-parser";
import type { PhrasesDocument } from "./types.mts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(projectRoot, "phrases");
const outputPath = resolve(projectRoot, "phrases.json");

const entries = (await readdir(sourceDir))
	.filter((name) => name.endsWith(".jsonc"))
	.sort();

if (entries.length === 0) {
	throw new Error(`No .jsonc files found in ${sourceDir}`);
}

const phrases: string[] = [];

for (const entry of entries) {
	const filePath = resolve(sourceDir, entry);
	const source = await readFile(filePath, "utf8");
	const parseErrors: Parameters<typeof parse>[1] = [];
	const document = parse(source, parseErrors, { allowTrailingComma: true }) as
		| PhrasesDocument
		| undefined;

	if (parseErrors.length > 0) {
		const errors = parseErrors
			.map((error) => printParseErrorCode(error.error))
			.join(", ");
		throw new Error(`Could not parse ${filePath}: ${errors}`);
	}

	if (
		!document ||
		!Array.isArray(document.phrases) ||
		document.phrases.some((phrase) => typeof phrase !== "string")
	) {
		throw new Error(`Expected ${filePath} to contain a "phrases" string array`);
	}

	phrases.push(...document.phrases);
}

await writeFile(outputPath, `${JSON.stringify({ phrases }, null, 4)}\n`);
console.log(
	`Built ${outputPath} with ${phrases.length} phrases from ${entries.length} files.`,
);
