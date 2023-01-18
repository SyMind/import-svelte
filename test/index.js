'use strict';
const fs = require('fs');
const crypto = require('crypto');
const test = require('ava');
const findCacheDir = require('find-cache-dir');
const rimraf = require('rimraf');
const svelte = require('svelte/compiler');
const importSvelte = require('..');
const packageJson = require('../package.json');

const fixturePath = name => `${__dirname}/fixtures/${name}`;
const diskCacheDirectory = findCacheDir({name: 'import-svelte'});
const clearDiskCache = () => rimraf.sync(diskCacheDirectory);

// Hacky - delete from memory cache, so it will use the disk cache
const deleteFromMemoryCache = name => {
	delete require.cache[`${fixturePath(name)}.js`];
};

test('throw when module id is missing', t => {
	t.throws(() => importSvelte(), TypeError, 'Expected a string');
});

test('import svelte component and auto-detect pragma', t => {
	t.notThrows(() => {
		importSvelte(fixturePath('App.svelte'));
	});
});

const source = fs.readFileSync(fixturePath('Cache.svelte'), 'utf8');
const contents = JSON.stringify({
	source,
	options: {
		cache: true,
        format: 'cjs'
	},
	version: packageJson.version
});

const hash = crypto.createHash('md5').update(contents).digest('hex');
const diskCacheFile = `${diskCacheDirectory}/${hash}.js`;

test('creates appropriate disk cache file', t => {
	clearDiskCache();
	t.false(fs.existsSync(diskCacheFile));

	importSvelte(fixturePath('Cache.svelte'));
	t.true(fs.existsSync(diskCacheFile));
});
