import { readFile, writeFile } from "node:fs/promises";
import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";

const argumentsList = process.argv.slice(2);
const sourcePath = getOption("source", "phrases.json");
const targetPath = getOption("target");
const propertyPath = getOption("property", "phrases");
const outputPath = getOption("output");
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
const mergedPhrases = [];
const existingPhrases = new Set();
let addedCount = 0;

for (const phrase of targetPhrases) {
    if (!existingPhrases.has(phrase)) {
        mergedPhrases.push(phrase);
        existingPhrases.add(phrase);
    }
}

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
    modify(target, resolvePropertyPath(targetDocument, propertyPath), mergedPhrases, {
        formattingOptions: { insertSpaces: true, tabSize: 4 },
    }),
);

if (writeInPlace || outputPath) {
    await writeFile(outputPath ?? targetPath, mergedTarget);
} else {
    process.stdout.write(mergedTarget);
}

console.error(
    `Merged ${addedCount} new phrases; ` +
    `skipped ${sourcePhrases.length - addedCount} duplicates. ` +
    `Target already contained ${duplicateCount} duplicate values.`,
);

function getOption(name, defaultValue) {
    const optionIndex = argumentsList.indexOf(`--${name}`);
    return optionIndex === -1 ? defaultValue : argumentsList[optionIndex + 1];
}

function parseDocument(content, path) {
    const errors = [];
    const document = parse(content, errors, { allowTrailingComma: true });

    if (errors.length > 0) {
        const details = errors.map((error) => printParseErrorCode(error.error)).join(", ");
        throw new Error(`Could not parse ${path}: ${details}`);
    }

    return document;
}

function getPhrases(document, path, property) {
    const phrases = property === "phrases" ? document?.phrases : getNestedValue(document, property);

    if (!Array.isArray(phrases) || phrases.some((phrase) => typeof phrase !== "string")) {
        throw new Error(`Expected ${path} to contain a string array at "${property}"`);
    }

    return phrases;
}

function getNestedValue(document, path) {
    const keys = path.split(".");
    let value = document;

    for (let index = 0; index < keys.length; index += 1) {
        if (value === null || typeof value !== "object") {
            return undefined;
        }

        for (let end = keys.length; end > index; end -= 1) {
            const candidate = keys.slice(index, end).join(".");
            if (Object.hasOwn(value, candidate)) {
                value = value[candidate];
                index = end - 1;
                break;
            }
        }
    }

    return value;
}

function resolvePropertyPath(document, path) {
    const keys = path.split(".");
    const resolvedPath = [];
    let value = document;

    for (let index = 0; index < keys.length; index += 1) {
        if (value === null || typeof value !== "object") {
            return keys;
        }

        let matched = false;
        for (let end = keys.length; end > index; end -= 1) {
            const candidate = keys.slice(index, end).join(".");
            if (Object.hasOwn(value, candidate)) {
                resolvedPath.push(candidate);
                value = value[candidate];
                index = end - 1;
                matched = true;
                break;
            }
        }

        if (!matched) {
            resolvedPath.push(keys[index]);
            value = value[keys[index]];
        }
    }

    return resolvedPath;
}