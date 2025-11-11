
//#region ../shared/src/index.ts
function* forEachTouchingNode(ts, sourceFile, position) {
	yield* binaryVisit(ts, sourceFile, sourceFile, position);
}
function* binaryVisit(ts, sourceFile, node, position) {
	const nodes = [];
	ts.forEachChild(node, (child) => {
		nodes.push(child);
	});
	let left = 0;
	let right = nodes.length - 1;
	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const node$1 = nodes[mid];
		if (position > node$1.getEnd()) left = mid + 1;
		else if (position < node$1.getStart(sourceFile)) right = mid - 1;
		else {
			yield node$1;
			yield* binaryVisit(ts, sourceFile, node$1, position);
			return;
		}
	}
}
function isTextSpanWithin(node, textSpan, sourceFile) {
	return textSpan.start + textSpan.length <= node.getEnd() && textSpan.start >= node.getStart(sourceFile);
}

//#endregion
//#region src/index.ts
const plugin = (module$1) => {
	const { typescript: ts } = module$1;
	return { create(info) {
		for (const [key, method] of [
			["findRenameLocations", findRenameLocations],
			["findReferences", findReferences],
			["getDefinitionAndBoundSpan", getDefinitionAndBoundSpan],
			["getFileReferences", getFileReferences]
		]) {
			const original = info.languageService[key];
			info.languageService[key] = method(ts, info, original);
		}
		return info.languageService;
	} };
};
var src_default = plugin;
const declarationRE = /\.d\.(?:c|m)?ts$/;
function createVisitor(getter) {
	return (ts, textSpan, sourceFile) => {
		for (const node of forEachTouchingNode(ts, sourceFile, textSpan.start)) if (ts.isPropertySignature(node) && node.type || ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.type) {
			const target = getter(ts, node.name, node.type, textSpan, sourceFile);
			if (target) return target;
		}
	};
}
const visitForwardImports = createVisitor((ts, name, type, textSpan, sourceFile) => {
	if (!isTextSpanWithin(name, textSpan, sourceFile)) return;
	while (ts.isTypeReferenceNode(type) && type.typeArguments?.length) type = type.typeArguments[0];
	if (ts.isIndexedAccessTypeNode(type)) return type.indexType;
	else if (ts.isImportTypeNode(type)) return type.qualifier ?? type.argument;
});
const visitBackwardImports = createVisitor((ts, name, type, textSpan, sourceFile) => {
	while (ts.isTypeReferenceNode(type) && type.typeArguments?.length) type = type.typeArguments[0];
	const targets = [];
	if (ts.isIndexedAccessTypeNode(type)) {
		if (ts.isLiteralTypeNode(type.indexType) && ts.isStringLiteral(type.indexType.literal)) {
			targets.push(type.indexType);
			if (type.indexType.literal.text === "default" && ts.isImportTypeNode(type.objectType)) targets.push(type.objectType.argument);
		}
	} else if (ts.isImportTypeNode(type)) {
		targets.push(type.qualifier ?? type.argument);
		if (type.qualifier && ts.isIdentifier(type.qualifier) && type.qualifier.text === "default") targets.push(type.argument);
	} else return;
	if (targets.some((target) => isTextSpanWithin(target, textSpan, sourceFile))) return name;
});
function findRenameLocations(ts, info, findRenameLocations$1) {
	return (...args) => {
		const result = findRenameLocations$1(...args);
		if (!result?.length) return result;
		const program = info.languageService.getProgram();
		const preferences = typeof args[4] === "object" ? args[4] : {};
		const locations = [...result];
		for (const location of result) {
			const sourceFile = program.getSourceFile(location.fileName);
			if (!sourceFile) continue;
			if (!declarationRE.test(location.fileName)) continue;
			const args$1 = [
				ts,
				location.textSpan,
				sourceFile
			];
			const node = visitForwardImports(...args$1) ?? visitBackwardImports(...args$1);
			if (!node) continue;
			const position = node.getStart(sourceFile);
			const res = findRenameLocations$1(location.fileName, position, false, false, preferences);
			if (res?.length) locations.push(...res);
		}
		return locations;
	};
}
function findReferences(ts, info, findReferences$1) {
	return (...args) => {
		const result = findReferences$1(...args);
		if (!result?.length) return result;
		const program = info.languageService.getProgram();
		for (const symbol of result) {
			const references = new Set(symbol.references);
			for (const reference of symbol.references) {
				const sourceFile = program.getSourceFile(reference.fileName);
				if (!sourceFile) continue;
				if (!declarationRE.test(reference.fileName)) continue;
				const node = visitBackwardImports(ts, reference.textSpan, sourceFile);
				if (!node) continue;
				const position = node.getStart(sourceFile);
				const res = info.languageService.getReferencesAtPosition(reference.fileName, position)?.filter((entry) => entry.fileName !== reference.fileName || position < entry.textSpan.start || position > entry.textSpan.start + entry.textSpan.length);
				if (res?.length) {
					for (const reference$1 of res) references.add(reference$1);
					references.delete(reference);
				}
			}
			symbol.references = [...references];
		}
		return result;
	};
}
function getDefinitionAndBoundSpan(ts, info, getDefinitionAndBoundSpan$1) {
	return (...args) => {
		const result = getDefinitionAndBoundSpan$1(...args);
		if (!result?.definitions?.length) return result;
		const program = info.languageService.getProgram();
		const definitions = new Set(result.definitions);
		for (const definition of result.definitions) {
			const sourceFile = program.getSourceFile(definition.fileName);
			if (!sourceFile) continue;
			if (!declarationRE.test(definition.fileName)) continue;
			const node = visitForwardImports(ts, definition.textSpan, sourceFile);
			if (!node) continue;
			const position = node.getStart(sourceFile);
			const res = getDefinitionAndBoundSpan$1(definition.fileName, position);
			if (res?.definitions?.length) {
				for (const definition$1 of res.definitions) definitions.add(definition$1);
				definitions.delete(definition);
			}
		}
		return {
			definitions: [...definitions],
			textSpan: result.textSpan
		};
	};
}
function getFileReferences(ts, info, getFileReferences$1) {
	return (fileName) => {
		const result = getFileReferences$1(fileName);
		if (!result?.length) return result;
		const program = info.languageService.getProgram();
		const references = new Set(result);
		for (const reference of result) {
			const sourceFile = program.getSourceFile(reference.fileName);
			if (!sourceFile) continue;
			if (!declarationRE.test(reference.fileName)) continue;
			const node = visitBackwardImports(ts, reference.textSpan, sourceFile);
			if (!node) continue;
			const position = node.getStart(sourceFile);
			const res = info.languageService.getReferencesAtPosition(reference.fileName, position);
			if (res?.length) {
				for (const reference$1 of res.slice(1)) references.add(reference$1);
				references.delete(reference);
			}
		}
		return [...references];
	};
}

//#endregion
module.exports = src_default;