# repopal
repo reader for LLM

## How to install
1. git clone https://github.com/whyang9701/repopal.git
2. cd repopal
3. npm install
4. npm run build
3. npm link
## Features
- Read and analyze repositories
- Supports multiple file formats
- Easy integration with LLMs
## How to use
```bash
repopal .
```
output

~~~Markdown
# Repository Context

## File System Location

/Users/user1/repopal

## Git Info

- Commit: e6386c8e959404e2e323fddc46a3d3c1c3ee5c66
- Branch: main
- Author: whyang <whyang9701@gmail.com>
- Date: Thu Sep 18 11:44:32 2025 -04:00

## Structure

```
__tests__/
  unit/
build/
  __tests__/
    unit/
      main.test.js
      main.test.js.map
    vitest.config.js
    vitest.config.js.map
  src/
    fileMap.js
    fileMap.js.map
    fileUtil.js
    fileUtil.js.map
    gitUtil.js
    gitUtil.js.map
    listDirectories.js
    listDirectories.js.map
    main.js
    main.js.map
    printTree.js
    printTree.js.map
src/
eslint.config.mjs
LICENSE
output.txt
package-lock.json
package.json
tsconfig.json
tsconfig.release.json
```

## File Contents
### File: package.json
```JSON
{
  "name": "repopal",
  "version": "0.0.1",
  "description": "repo reader for LLM",
  "type": "module",
  "engines": {
    "node": ">= 22.11 < 23"
  },
  ...
}
```
...
## Summary
- Total files: 37
- Total lines: 1531
~~~

## Additional Usage
### Specify include patterns (comma-separated):
```bash
repopal --include '**/*.js,**/*.ts' .
```
### Specify exclude patterns (comma-separated):
```bash
repopal --exclude 'node_modules/**,build/**' .
```
### Output to a file:
```bash
repopal -o output.txt .
```

### Filter modified files within 7 days
```bash
repopal . --recent
repopal . -r
```

### Filter modified files more than 7 days
```bash
repopal . --recent 14
repopal . -r 21

```