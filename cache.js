const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const makeDir = require('make-dir');
const findCacheDir = require('find-cache-dir');
const svelte = require('svelte/compiler')

let directory;

/**
 * Build the filename for the cached file
 *
 * @param  {String} source  Original contents of the file to be cached
 * @param  {Object} options Options passed to importSvelte
 * @param  {String} version Version of import-svelte
 *
 * @return {String}
 */
const filename = (source, options, version) => {
	const hash = crypto.createHash('md5');
	const contents = JSON.stringify({source, options, version});
	hash.update(contents);

	return hash.digest('hex') + '.js';
};

/**
 * Handle the cache
 *
 * @params {String} directory
 * @params {Object} parameters
 */
const handleCache = (directory, parameters) => {
	const { options, source, version } = parameters;
    const { cache, ...compilerOptions } = options;

	if (!cache) {
		const { js } = svelte.compile(source, compilerOptions);
		return js.code;
	}

	const file = path.join(directory, filename(source, options, version));

	try {
		// No errors mean that the file was previously cached
		// we just need to return it
		return fs.readFileSync(file).toString();
		// eslint-disable-next-line no-unused-vars
	} catch (error) {}

	const fallback = directory !== os.tmpdir();

	// Make sure the directory exists.
	try {
		makeDir.sync(directory);
	} catch (error) {
		if (fallback) {
			return handleCache(os.tmpdir(), parameters);
		}

		throw error;
	}

	// Otherwise just transform the file
	// return it to the user asap and write it in cache
	const { js } = svelte.compile(source, compilerOptions);

	try {
		fs.writeFileSync(file, js.code);
	} catch (error) {
		if (fallback) {
			// Fallback to tmpdir if node_modules folder not writable
			return handleCache(os.tmpdir(), parameters);
		}

		throw error;
	}

	return js.code;
};

/**
 * Retrieve file from cache, or create a new one for future reads
 *
 * @param  {Object}   parameters
 * @param  {String}   parameters.modulePath
 * @param  {String}   parameters.source     Original contents of the file to be cached
 * @param  {Object}   parameters.options    Options passed to importSvelte
 * @param  {String}   parameters.version    Version of import-svelte
 */
module.exports = parameters => {
	if (!directory) {
		directory = findCacheDir({ name: 'import-svelte' }) || os.tmpdir();
	}

	return handleCache(directory, parameters);
};
