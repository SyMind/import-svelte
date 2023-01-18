# import-svelte

Require and transpile Svelte on the fly

# Install

```bash
npm install import-svelte
```

# Usage

```js
const importSvelte = require('import-svelte');

const App = importSvelte('./App.svelte').default
const inst = new App({ target: true })
```

# License

[LICENSE](./LICENSE)
