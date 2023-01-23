const fs = require('fs');
const cache = require('./cache');
const { version } = require('./package.json');

const importSvelte = (modulePath, options) => {
	if (typeof modulePath !== 'string') {
		throw new TypeError('The "modulePath" argument must be of type string. Received ' + typeof id);
	}

	options = {
		cache: true,
		...options,
        format: 'cjs'
	};

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
