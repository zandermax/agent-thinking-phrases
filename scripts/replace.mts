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
		"Usage: npm run replace -- --target <file> [--property <name>] [--source <file>] [--output <file> | --write]",
	);
}

const source = await readFile(sourcePath, "utf8");
const target = await readFile(targetPath, "utf8");
const sourceDocument = parseDocument(source, sourcePath);
const targetDocument = parseDocument(target, targetPath);
const sourcePhrases = getPhrases(sourceDocument, sourcePath, "phrases");
const targetPhrases = getPhrases(targetDocument, targetPath, propertyPath);

const replacedTarget = applyEdits(
	target,
	modify(
		target,
		resolvePropertyPath(targetDocument, propertyPath),
		sourcePhrases,
		{
			formattingOptions: { insertSpaces: true, tabSize: 4 },
		},
	),
);

if (writeInPlace || outputPath) {
	await writeFile(outputPath ?? targetPath, replacedTarget);
} else {
	process.stdout.write(replacedTarget);
}

console.error(
	`Replaced ${targetPhrases.length} phrase(s) in the target with ${sourcePhrases.length} phrase(s) from the source.`,
);
