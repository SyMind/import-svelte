const path = require('path');
const fs = require('fs');
const resolveFrom = require('resolve-from');
const callerPath = require('caller-path');
const cache = require('./cache');
const { version } = require('./package.json');

const importSvelte = (id, options) => {
	if (typeof id !== 'string') {
		throw new TypeError('The "id" argument must be of type string. Received ' + typeof id);
	}

	options = {
		cache: true,
		...options,
        format: 'cjs'
	};

	const modulePath = resolveFrom(path.dirname(callerPath()), id);

	if (!options.cache) {
		delete require.cache[modulePath];
	}

    const hookExt = '.svelte';

    const oldExtension = require.extensions[hookExt];

	require.extensions[hookExt] = (module, filename) => {
        const source = fs.readFileSync(filename, 'utf8');
        const result = cache({
            modulePath,
            options,
            source,
            version
        });
        module._compile(result, filename)
	};

	const m = require(modulePath);
    require.extensions[hookExt] = oldExtension;

	if (!options.cache) {
		delete require.cache[modulePath];
	}

	return m;
};

module.exports = importSvelte;
module.exports.default = importSvelte;

module.exports.create = options => {
	return id => importSvelte(id, options);
};
