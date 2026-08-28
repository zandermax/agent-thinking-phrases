import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";
import type { PhrasesDocument } from "./types.mts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = process.env.PHRASES_DIR ?? resolve(projectRoot, "phrases");

const entries = (await readdir(sourceDir)).filter((name) =>
	name.endsWith(".jsonc"),
);
let changedCount = 0;

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

	const sortedPhrases = [...document.phrases].sort((a, b) =>
		a.localeCompare(b),
	);
	const isAlreadySorted = sortedPhrases.every(
		(phrase, index) => phrase === document.phrases[index],
	);

	if (isAlreadySorted) {
		continue;
	}

	const edited = applyEdits(
		source,
		modify(source, ["phrases"], sortedPhrases, {
			formattingOptions: { insertSpaces: true, tabSize: 4 },
		}),
	);

	await writeFile(filePath, edited);
	changedCount += 1;
	console.log(`Sorted ${entry}`);
}

console.log(
	`Sorted ${changedCount} file(s); ${entries.length - changedCount} already sorted.`,
);
