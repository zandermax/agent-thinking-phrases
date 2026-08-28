import { type JSONPath, parse, printParseErrorCode } from "jsonc-parser";

export function getOption(
	argumentsList: string[],
	name: string,
): string | undefined;
export function getOption(
	argumentsList: string[],
	name: string,
	defaultValue: string,
): string;
export function getOption(
	argumentsList: string[],
	name: string,
	defaultValue?: string,
): string | undefined {
	const optionIndex = argumentsList.indexOf(`--${name}`);
	return optionIndex === -1 ? defaultValue : argumentsList[optionIndex + 1];
}

export function parseDocument(content: string, path: string): unknown {
	const errors: Parameters<typeof parse>[1] = [];
	const document = parse(content, errors, { allowTrailingComma: true });

	if (errors.length > 0) {
		const details = errors
			.map((error) => printParseErrorCode(error.error))
			.join(", ");
		throw new Error(`Could not parse ${path}: ${details}`);
	}

	return document;
}

export function getPhrases(
	document: unknown,
	path: string,
	property: string,
): string[] {
	const phrases =
		property === "phrases"
			? (document as { phrases?: unknown })?.phrases
			: getNestedValue(document, property);

	if (phrases === undefined) {
		return [];
	}

	if (
		!Array.isArray(phrases) ||
		phrases.some((phrase) => typeof phrase !== "string")
	) {
		throw new Error(
			`Expected ${path} to contain a string array at "${property}"`,
		);
	}

	return phrases;
}

export function getNestedValue(document: unknown, path: string): unknown {
	const keys = path.split(".");
	let value = document;

	for (let index = 0; index < keys.length; index += 1) {
		if (value === null || typeof value !== "object") {
			return undefined;
		}

		let matched = false;
		for (let end = keys.length; end > index; end -= 1) {
			const candidate = keys.slice(index, end).join(".");
			if (Object.hasOwn(value, candidate)) {
				value = (value as Record<string, unknown>)[candidate];
				index = end - 1;
				matched = true;
				break;
			}
		}

		if (!matched) {
			return undefined;
		}
	}

	return value;
}

export function resolvePropertyPath(document: unknown, path: string): JSONPath {
	const keys = path.split(".");
	const resolvedPath: JSONPath = [];
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
				value = (value as Record<string, unknown>)[candidate];
				index = end - 1;
				matched = true;
				break;
			}
		}

		if (!matched) {
			const key = keys[index] as string;
			resolvedPath.push(key);
			value = (value as Record<string, unknown>)[key];
		}
	}

	return resolvedPath;
}
