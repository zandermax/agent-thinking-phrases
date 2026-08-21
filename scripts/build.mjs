import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, printParseErrorCode } from "jsonc-parser";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "phrases.jsonc");
const outputPath = resolve(projectRoot, "phrases.json");

const source = await readFile(sourcePath, "utf8");
const parseErrors = [];
const document = parse(source, parseErrors, { allowTrailingComma: true });

if (parseErrors.length > 0) {
    const errors = parseErrors
        .map((error) => printParseErrorCode(error.error))
        .join(", ");
    throw new Error(`Could not parse ${sourcePath}: ${errors}`);
}

if (!document || !Array.isArray(document.phrases)) {
    throw new Error('Expected phrases.jsonc to contain a "phrases" array');
}

await writeFile(outputPath, `${JSON.stringify(document, null, 4)}\n`);
console.log(`Built ${outputPath} with ${document.phrases.length} phrases.`);