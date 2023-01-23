# import-svelte

Require and transpile Svelte on the fly

# Install

```bash
npm install import-svelte
```

# Usage

```js
const importSvelte = require('import-svelte');

const modulePath = path.resolve(__dirname, './App.svelte')
const App = importSvelte(modulePath)
const inst = new App({
    target: document.body // use domjs
})
```

# License

[MIT](./LICENSE)
