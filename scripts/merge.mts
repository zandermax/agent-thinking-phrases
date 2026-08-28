import { readFile, writeFile } from "node:fs/promises";
import { applyEdits, modify } from "jsonc-parser";
import {
	getOption,
	getPhrases,
	parseDocument,
	resolvePropertyPath,
} from "./lib/document-utils.mts";

const argumentsList = process.argv.slice(2);
const sourcePath = getOption(argumentsList, "source", "phrases.json");
const targetPath = getOption(argumentsList, "target");
const propertyPath = getOption(argumentsList, "property", "phrases");
const outputPath = getOption(argumentsList, "output");
const writeInPlace = argumentsList.includes("--write");

if (!targetPath || (writeInPlace && outputPath)) {
	throw new Error(
		"Usage: npm run merge -- --target <file> [--property <name>] [--source <file>] [--output <file> | --write]",
	);
}

const source = await readFile(sourcePath, "utf8");
const target = await readFile(targetPath, "utf8");
const sourceDocument = parseDocument(source, sourcePath);
const targetDocument = parseDocument(target, targetPath);
const sourcePhrases = getPhrases(sourceDocument, sourcePath, "phrases");
const targetPhrases = getPhrases(targetDocument, targetPath, propertyPath);
const mergedPhrases = [...targetPhrases];
const existingPhrases = new Set(targetPhrases);
let addedCount = 0;

for (const phrase of sourcePhrases) {
	if (!existingPhrases.has(phrase)) {
		mergedPhrases.push(phrase);
		existingPhrases.add(phrase);
		addedCount += 1;
	}
}

const duplicateCount = targetPhrases.length - new Set(targetPhrases).size;
const mergedTarget = applyEdits(
	target,
	modify(
		target,
		resolvePropertyPath(targetDocument, propertyPath),
		mergedPhrases,
		{
			formattingOptions: { insertSpaces: true, tabSize: 4 },
		},
	),
);

if (writeInPlace || outputPath) {
	await writeFile(outputPath ?? targetPath, mergedTarget);
} else {
	process.stdout.write(mergedTarget);
}

console.error(
	`Merged ${addedCount} new phrases; ` +
	`skipped ${sourcePhrases.length - addedCount} duplicates. ` +
	`Preserved ${duplicateCount} duplicate values already in the target.`,
);
