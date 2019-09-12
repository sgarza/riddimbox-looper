# Javascript library boilerplate

This repo contains the minimum code needed to create a Javascript library that can be used in either NodeJS and in the Browser in any possible way.

## Getting started

Clone this repository and install its dependencies:

```bash
git clone --depth 1 https://github.com/sgarza/javascript-library-boilerplate my-module
cd my-module
npm install
```

Open the [package.json](package.json) file and edit the value of the property `moduleName`. It's value will be name of the global variable used when the module is loaded via `<script src="module/path"></script>`.

Remove your `.git` folder and start over `rmdir .git && git init`.


## Build

```bash
npm run build
```

## License

[MIT](LICENSE).
