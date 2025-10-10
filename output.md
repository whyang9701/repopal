# Repository Context

## File System Location

/Users/phillips/Repo/OSD600/repopal

## Git Info

- Commit: efab127cf732cd9117b57cdbc1e505b32a91aeaf
- Branch: refactoring
- Author: whyang <whyang9701@gmail.com>
- Date: Fri Oct 10 13:39:06 2025 -04:00

## Structure

```
build/
  __tests__/
    unit/
      main.test.js
      main.test.js.map
    vitest.config.js
    vitest.config.js.map
  src/
    configUtil.js
    configUtil.js.map
    fileMap.js
    fileMap.js.map
    fileUtil.js
    fileUtil.js.map
    gitUtil.js
    gitUtil.js.map
    main.js
    main.js.map
src/
  main.ts
output.md
output.txt
```

## File Contents

### File: output.md
```
File too large to include (over 16KB)
```
            
### File: output.txt
```
File too large to include (over 16KB)
```
            
### File: src/main.ts (Modified: 2025-10-10 13:44:50)
```TypeScript
#!/usr/bin/env node

import { Command, Option } from 'commander'
import * as path from 'path'
import fs from 'fs'
import { getFilesFromDirectory, getDirectoryStructureString, getFiles, getRecentModifiedFiles, getModifiedTimeString } from './fileUtil.js'
import { fileExtensionsToLanguageMap } from './fileMap.js'
import { getGitInfo, getGitInfoString } from './gitUtil.js'
import { loadConfig } from './configUtil.js'

// Load TOML config file if it exists
const config = loadConfig()

const program = new Command()
program
  .name('repopal')
  .description('repo reader for LLM').version('0.1.0', '-v, --version', 'output the current version')
  .argument('[args...]', 'directory to scan or list of files')
  .addOption(new Option('-o, --output <file>', 'output to file instead of console').default(config.output))
  .addOption(new Option('--include <pattern>', 'include files matching the pattern, ignored if specific files are provided').default(config.include))
  .addOption(new Option('--exclude <pattern>', 'exclude files matching the pattern, ignored if specific files are provided').conflicts('include').default(config.exclude))
  .addOption(new Option('-r, --recent [days]', 'only include the most recently (7 days) modified files per directory').default(config.recent))
  .addOption(new Option('--preview [lines]', 'enable preview features, if not specified, defaults to 5 lines').default(config.preview))
  .action(async (args, options) => {
    args = args.length ? args : ['.']
    try {
      const includePatterns = options.include ? String(options.include).split(',') : ['**/*']
      const excludePatterns = options.exclude ? String(options.exclude).split(',') : []
      // first arg is directory or file
      let currentWorkingDirectory = path.join(process.cwd(), args[0])
      let filepathArray: Array<string> = []
      // one argument, check args[0] is a directory or file
      if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
        filepathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns)
      }
      else {
        currentWorkingDirectory = process.cwd()
        filepathArray = await getFiles(args)
      }
      if (options.recent) {
        const recentDays = parseInt(String(options.recent), 10) || 7
        filepathArray = getRecentModifiedFiles(currentWorkingDirectory, filepathArray, recentDays)
      }
      const gitInfo = await getGitInfo(currentWorkingDirectory)
      const outputString = await getOutputString(currentWorkingDirectory, gitInfo, filepathArray, options.preview)
      if (options.output) {
        fs.writeFileSync(options.output, outputString)
      } else {
        console.log(outputString)
      }
    }
    catch (err) {
      console.error("Error: ", err.message)
      process.exit(1)
    }
  })
program.parse()


// form final output string
async function getOutputString(currentWorkingDirectory: string, gitInfo: object, filePathArray: Array<string>, preview: number): Promise<string> {
  let outputString = `# Repository Context

## File System Location

${currentWorkingDirectory}

## Git Info

${getGitInfoString(gitInfo)}

## Structure

${'```'}
${getDirectoryStructureString(filePathArray)}
${'```'}

## File Contents
`
  let lineCount = 0
  filePathArray.forEach(filePath => {
    const fullPath = path.join(currentWorkingDirectory, filePath)
    const ext = path.extname(filePath).toLowerCase()
    const language = fileExtensionsToLanguageMap[ext] || ''
    const fileState = fs.statSync(fullPath)
    // check if file is small enough
    if (fileState.isFile() && fileState.size < 16 * 1024) {
      // read each file content
      const contentBuffer = fs.readFileSync(fullPath)
      let contentString;
      if (preview) {
        //read first 5 lines only
        preview = typeof preview === 'boolean' ? 5 : parseInt(String(preview), 10)
        const lines = contentBuffer.toString().split('\n')
        contentString = lines.slice(0, preview).join('\n')
        if (lines.length > preview) {
          contentString += `\n... (file truncated, total ${lines.length} lines)`
        }
        lineCount += contentString.split('\n').length
      }
      else {
        lineCount += contentBuffer.toString().split('\n').length
        contentString = contentBuffer.toString()
      }
      outputString += `
### File: ${filePath} (Modified: ${getModifiedTimeString(fileState)})
${ext === '.md' ? '````' : '```'}${language}
${contentString}
${ext === '.md' ? '````' : '```'}
            `
    }
    else if (fileState.isFile()) {
      outputString += `
### File: ${filePath}
${'```'}
File too large to include (over 16KB)
${'```'}
            `
    }
  })
  outputString += `
## Summary
- Total files: ${filePathArray.length}
- Total lines: ${lineCount}
`
  return outputString

}


```
            
### File: build/__tests__/vitest.config.js (Modified: 2025-10-10 13:44:56)
```JavaScript
import { configDefaults, coverageConfigDefaults, defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, 'build/**/*'],
        coverage: {
            provider: 'v8',
            exclude: [...coverageConfigDefaults.exclude, 'build/**/*']
        },
    },
});
//# sourceMappingURL=vitest.config.js.map
```
            
### File: build/__tests__/vitest.config.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"vitest.config.js","sourceRoot":"","sources":["../../__tests__/vitest.config.ts"],"names":[],"mappings":"AAAA,OAAO,EAAE,cAAc,EAAE,sBAAsB,EAAE,YAAY,EAAE,MAAM,eAAe,CAAA;AAEpF,eAAe,YAAY,CAAC;IAC1B,IAAI,EAAE;QACJ,OAAO,EAAE,CAAC,GAAG,cAAc,CAAC,OAAO,EAAE,YAAY,CAAC;QAClD,QAAQ,EAAE;YACR,QAAQ,EAAE,IAAI;YACd,OAAO,EAAE,CAAC,GAAG,sBAAsB,CAAC,OAAO,EAAE,YAAY,CAAC;SAC3D;KACF;CACF,CAAC,CAAA"}
```
            
### File: build/src/configUtil.js (Modified: 2025-10-10 13:44:56)
```JavaScript
// scripts/configUtil.ts
import * as fs from 'fs';
import * as path from 'path';
import * as toml from '@iarna/toml';
const CONFIG_FILENAME = '.repopal-config.toml';
/**
 * Load TOML config file from current directory if it exists
 * @param cwd Current working directory
 * @returns Parsed config object or empty object if file doesn't exist
 * @throws Error if TOML file exists but cannot be parsed
 */
export function loadConfig(cwd = process.cwd()) {
    const configPath = path.join(cwd, CONFIG_FILENAME);
    // If config file doesn't exist, return empty config
    if (!fs.existsSync(configPath)) {
        return {};
    }
    try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const parsed = toml.parse(configContent);
        // Return only the config object, ignoring any unrecognized options
        // This allows for future extensibility
        return parsed;
    }
    catch (error) {
        console.error(`Error: Failed to parse ${CONFIG_FILENAME}`);
        console.error(error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=configUtil.js.map
```
            
### File: build/src/configUtil.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"configUtil.js","sourceRoot":"","sources":["../../src/configUtil.ts"],"names":[],"mappings":"AAAA,wBAAwB;AACxB,OAAO,KAAK,EAAE,MAAM,IAAI,CAAA;AACxB,OAAO,KAAK,IAAI,MAAM,MAAM,CAAA;AAC5B,OAAO,KAAK,IAAI,MAAM,aAAa,CAAA;AAEnC,MAAM,eAAe,GAAG,sBAAsB,CAAA;AAU9C;;;;;GAKG;AACH,MAAM,UAAU,UAAU,CAAC,MAAc,OAAO,CAAC,GAAG,EAAE;IACpD,MAAM,UAAU,GAAG,IAAI,CAAC,IAAI,CAAC,GAAG,EAAE,eAAe,CAAC,CAAA;IAElD,oDAAoD;IACpD,IAAI,CAAC,EAAE,CAAC,UAAU,CAAC,UAAU,CAAC,EAAE,CAAC;QAC/B,OAAO,EAAE,CAAA;IACX,CAAC;IAED,IAAI,CAAC;QACH,MAAM,aAAa,GAAG,EAAE,CAAC,YAAY,CAAC,UAAU,EAAE,OAAO,CAAC,CAAA;QAC1D,MAAM,MAAM,GAAG,IAAI,CAAC,KAAK,CAAC,aAAa,CAAkB,CAAA;QAEzD,mEAAmE;QACnE,uCAAuC;QACvC,OAAO,MAAM,CAAA;IACf,CAAC;IAAC,OAAO,KAAK,EAAE,CAAC;QACf,OAAO,CAAC,KAAK,CAAC,0BAA0B,eAAe,EAAE,CAAC,CAAA;QAC1D,OAAO,CAAC,KAAK,CAAC,KAAK,CAAC,OAAO,CAAC,CAAA;QAC5B,OAAO,CAAC,IAAI,CAAC,CAAC,CAAC,CAAA;IACjB,CAAC;AACH,CAAC"}
```
            
### File: build/src/fileMap.js (Modified: 2025-10-10 13:44:56)
```JavaScript
export const fileExtensionsToLanguageMap = {
    ".adb": "Ada",
    ".ads": "Ada",
    ".ada": "Ada",
    ".asm": "Assembly",
    ".s": "Assembly",
    ".awk": "AWK",
    ".bat": "Batch",
    ".cmd": "Batch",
    ".bash": "Bash",
    ".sh": "Shell",
    ".zsh": "Zsh",
    ".ksh": "KornShell",
    ".fish": "Fish Shell",
    ".c": "C",
    ".h": "C",
    ".cil": "CIL",
    ".clj": "Clojure",
    ".cljc": "Clojure",
    ".cljs": "ClojureScript",
    ".coffee": "CoffeeScript",
    ".cr": "Crystal",
    ".cpp": "C++",
    ".cxx": "C++",
    ".cc": "C++",
    ".hpp": "C++",
    ".hh": "C++",
    ".hxx": "C++",
    ".cs": "C#",
    ".d": "D",
    ".dart": "Dart",
    ".el": "Emacs Lisp",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".erl": "Erlang",
    ".hrl": "Erlang",
    ".f": "Fortran",
    ".for": "Fortran",
    ".f90": "Fortran",
    ".f95": "Fortran",
    ".f03": "Fortran",
    ".fs": "F#",
    ".fsx": "F#",
    ".fsi": "F#",
    ".gd": "GDScript",
    ".go": "Go",
    ".groovy": "Groovy",
    ".hs": "Haskell",
    ".hx": "Haxe",
    ".java": "Java",
    ".jl": "Julia",
    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".md": "Markdown",
    ".cjs": "JavaScript",
    ".jsx": "JavaScript",
    ".json": "JSON",
    ".kt": "Kotlin",
    ".kts": "Kotlin Script",
    ".lisp": "Common Lisp",
    ".lsp": "Common Lisp",
    ".cl": "Common Lisp",
    ".l": "Lex",
    ".lex": "Lex",
    ".lua": "Lua",
    ".m": "Objective-C",
    ".mm": "Objective-C++",
    ".mojo": "Mojo",
    ".nim": "Nim",
    ".nims": "Nim Script",
    ".ml": "OCaml",
    ".mli": "OCaml",
    ".php": "PHP",
    ".pl": "Perl",
    ".pm": "Perl Module",
    ".ps1": "PowerShell",
    ".psm1": "PowerShell Module",
    ".psd1": "PowerShell Data",
    ".purs": "PureScript",
    ".py": "Python",
    ".pyw": "Python",
    ".qs": "Q#",
    ".r": "R",
    ".raku": "Raku",
    ".rakumod": "Raku Module",
    ".p6": "Raku",
    ".pm6": "Raku Module",
    ".rb": "Ruby",
    ".rs": "Rust",
    ".scala": "Scala",
    ".sc": "Scala Script",
    ".scm": "Scheme",
    ".ss": "Scheme",
    ".sql": "SQL",
    ".swift": "Swift",
    ".tcl": "Tcl",
    ".tsx": "TypeScript",
    ".ts": "TypeScript",
    ".vala": "Vala",
    ".vapi": "Vala API",
    ".vb": "Visual Basic .NET",
    ".vbs": "VBScript",
    ".wat": "WebAssembly",
    ".wast": "WebAssembly",
    ".zig": "Zig"
};
//# sourceMappingURL=fileMap.js.map
```
            
### File: build/src/fileMap.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"fileMap.js","sourceRoot":"","sources":["../../src/fileMap.ts"],"names":[],"mappings":"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"}
```
            
### File: build/src/fileUtil.js (Modified: 2025-10-10 13:44:56)
```JavaScript
// scripts/fileUtil.ts
import * as path from 'path';
import fg from 'fast-glob';
import fs from 'fs';
import { format } from 'date-fns';
function insert(root, relPath, isDir) {
    const parts = relPath.split('/').filter(Boolean);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        if (!current.children)
            current.children = new Map();
        let child = current.children.get(part);
        if (!child) {
            child = { name: part, isDir: isLast ? isDir : true };
            current.children.set(part, child);
        }
        else if (isLast && isDir) {
            child.isDir = true;
        }
        current = child;
    }
}
function printTree(root, prefix = '') {
    if (!root.children)
        return '';
    // Sort: directories first, then files, each group alphabetically
    const entries = Array.from(root.children.values()).sort((a, b) => {
        if (a.isDir !== b.isDir)
            return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    const lines = [];
    for (const node of entries) {
        lines.push(prefix + node.name + (node.isDir ? '/' : ''));
        if (node.isDir) {
            lines.push(printTree(node, prefix + '  '));
        }
    }
    return lines.filter(Boolean).join('\n');
}
export async function getFilesFromDirectory(rootDir = '.', includePatterns = ['**/*'], excludePatterns = []) {
    // Collect files & directories
    const entries = await fg(includePatterns, {
        cwd: rootDir,
        dot: false,
        onlyFiles: false,
        markDirectories: true,
        ignore: ['**/node_modules/**', '**/.git/**', ...excludePatterns]
    });
    return entries;
}
export async function getFiles(filesArray) {
    // Collect files & directories
    const entries = await fg(filesArray, {
        cwd: '.',
        dot: true,
        onlyFiles: true,
    });
    return entries;
}
export function getDirectoryStructureString(entries) {
    const root = { name: '', isDir: true, children: new Map() };
    for (const entry of entries) {
        const isDir = entry.endsWith('/');
        const cleaned = isDir ? entry.slice(0, -1) : entry;
        insert(root, cleaned, isDir);
    }
    return printTree(root);
}
export function getRecentModifiedFiles(rootDirectory, filePaths, days) {
    const now = new Date();
    return filePaths.filter(filePath => {
        const fullPath = path.join(rootDirectory, filePath);
        try {
            const fileState = fs.statSync(fullPath);
            const modifiedTime = new Date(fileState.mtime);
            return (now.getTime() - modifiedTime.getTime()) < days * 24 * 60 * 60 * 1000;
        }
        catch (error) {
            console.error(`Error accessing file: ${fullPath}. ${error.message}`);
            return false;
        }
    });
}
export function getModifiedTimeString(fileState) {
    return format(fileState.mtime, "yyyy-MM-dd HH:mm:ss");
}
//# sourceMappingURL=fileUtil.js.map
```
            
### File: build/src/fileUtil.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"fileUtil.js","sourceRoot":"","sources":["../../src/fileUtil.ts"],"names":[],"mappings":"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"}
```
            
### File: build/src/gitUtil.js (Modified: 2025-10-10 13:44:56)
```JavaScript
import { simpleGit } from "simple-git";
import { format } from 'date-fns';
//get git info
export async function getGitInfo(cwd) {
    const git = simpleGit({ baseDir: cwd });
    const logResult = await git.log();
    const branchResult = await git.branch();
    const result = {
        hash: logResult.latest.hash,
        branch: branchResult.current,
        author: logResult.latest.author_name,
        email: logResult.latest.author_email,
        date: format(logResult.latest.date, "EEE MMM dd HH:mm:ss yyyy XXX")
    };
    return result;
}
// output util for git info
export function getGitInfoString(result) {
    return `- Commit: ${result.hash}
- Branch: ${result.branch}
- Author: ${result.author} <${result.email}>
- Date: ${result.date}`;
}
//# sourceMappingURL=gitUtil.js.map
```
            
### File: build/src/gitUtil.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"gitUtil.js","sourceRoot":"","sources":["../../src/gitUtil.ts"],"names":[],"mappings":"AAAA,OAAO,EAAE,SAAS,EAAE,MAAM,YAAY,CAAA;AACtC,OAAO,EAAE,MAAM,EAAE,MAAM,UAAU,CAAA;AACjC,cAAc;AACd,MAAM,CAAC,KAAK,UAAU,UAAU,CAAC,GAAG;IAElC,MAAM,GAAG,GAAG,SAAS,CAAC,EAAE,OAAO,EAAE,GAAG,EAAE,CAAC,CAAA;IACvC,MAAM,SAAS,GAAG,MAAM,GAAG,CAAC,GAAG,EAAE,CAAA;IACjC,MAAM,YAAY,GAAG,MAAM,GAAG,CAAC,MAAM,EAAE,CAAA;IACvC,MAAM,MAAM,GAAG;QACb,IAAI,EAAE,SAAS,CAAC,MAAM,CAAC,IAAI;QAC3B,MAAM,EAAE,YAAY,CAAC,OAAO;QAC5B,MAAM,EAAE,SAAS,CAAC,MAAM,CAAC,WAAW;QACpC,KAAK,EAAE,SAAS,CAAC,MAAM,CAAC,YAAY;QACpC,IAAI,EAAE,MAAM,CAAC,SAAS,CAAC,MAAM,CAAC,IAAI,EAAE,8BAA8B,CAAC;KACpE,CAAA;IACD,OAAO,MAAM,CAAA;AACf,CAAC;AAED,2BAA2B;AAC3B,MAAM,UAAU,gBAAgB,CAAC,MAAM;IACrC,OAAO,aAAa,MAAM,CAAC,IAAI;YACrB,MAAM,CAAC,MAAM;YACb,MAAM,CAAC,MAAM,KAAK,MAAM,CAAC,KAAK;UAChC,MAAM,CAAC,IAAI,EAAE,CAAA;AACvB,CAAC"}
```
            
### File: build/src/main.js (Modified: 2025-10-10 13:44:56)
```JavaScript
#!/usr/bin/env node
import { Command, Option } from 'commander';
import * as path from 'path';
import fs from 'fs';
import { getFilesFromDirectory, getDirectoryStructureString, getFiles, getRecentModifiedFiles, getModifiedTimeString } from './fileUtil.js';
import { fileExtensionsToLanguageMap } from './fileMap.js';
import { getGitInfo, getGitInfoString } from './gitUtil.js';
import { loadConfig } from './configUtil.js';
// Load TOML config file if it exists
const config = loadConfig();
const program = new Command();
program
    .name('repopal')
    .description('repo reader for LLM').version('0.1.0', '-v, --version', 'output the current version')
    .argument('[args...]', 'directory to scan or list of files')
    .addOption(new Option('-o, --output <file>', 'output to file instead of console').default(config.output))
    .addOption(new Option('--include <pattern>', 'include files matching the pattern, ignored if specific files are provided').default(config.include))
    .addOption(new Option('--exclude <pattern>', 'exclude files matching the pattern, ignored if specific files are provided').conflicts('include').default(config.exclude))
    .addOption(new Option('-r, --recent [days]', 'only include the most recently (7 days) modified files per directory').default(config.recent))
    .addOption(new Option('--preview [lines]', 'enable preview features, if not specified, defaults to 5 lines').default(config.preview))
    .action(async (args, options) => {
    args = args.length ? args : ['.'];
    try {
        const includePatterns = options.include ? String(options.include).split(',') : ['**/*'];
        const excludePatterns = options.exclude ? String(options.exclude).split(',') : [];
        // first arg is directory or file
        let currentWorkingDirectory = path.join(process.cwd(), args[0]);
        let filepathArray = [];
        // one argument, check args[0] is a directory or file
        if (args.length === 1 && fs.statSync(currentWorkingDirectory).isDirectory()) {
            filepathArray = await getFilesFromDirectory(currentWorkingDirectory, includePatterns, excludePatterns);
        }
        else {
            currentWorkingDirectory = process.cwd();
            filepathArray = await getFiles(args);
        }
        if (options.recent) {
            const recentDays = parseInt(String(options.recent), 10) || 7;
            filepathArray = getRecentModifiedFiles(currentWorkingDirectory, filepathArray, recentDays);
        }
        const gitInfo = await getGitInfo(currentWorkingDirectory);
        const outputString = await getOutputString(currentWorkingDirectory, gitInfo, filepathArray, options.preview);
        if (options.output) {
            fs.writeFileSync(options.output, outputString);
        }
        else {
            console.log(outputString);
        }
    }
    catch (err) {
        console.error("Error: ", err.message);
        process.exit(1);
    }
});
program.parse();
// form final output string
async function getOutputString(currentWorkingDirectory, gitInfo, filePathArray, preview) {
    let outputString = `# Repository Context

## File System Location

${currentWorkingDirectory}

## Git Info

${getGitInfoString(gitInfo)}

## Structure

${'```'}
${getDirectoryStructureString(filePathArray)}
${'```'}

## File Contents
`;
    let lineCount = 0;
    filePathArray.forEach(filePath => {
        const fullPath = path.join(currentWorkingDirectory, filePath);
        const ext = path.extname(filePath).toLowerCase();
        const language = fileExtensionsToLanguageMap[ext] || '';
        const fileState = fs.statSync(fullPath);
        // check if file is small enough
        if (fileState.isFile() && fileState.size < 16 * 1024) {
            // read each file content
            const contentBuffer = fs.readFileSync(fullPath);
            let contentString;
            if (preview) {
                //read first 5 lines only
                preview = typeof preview === 'boolean' ? 5 : parseInt(String(preview), 10);
                const lines = contentBuffer.toString().split('\n');
                contentString = lines.slice(0, preview).join('\n');
                if (lines.length > preview) {
                    contentString += `\n... (file truncated, total ${lines.length} lines)`;
                }
                lineCount += contentString.split('\n').length;
            }
            else {
                lineCount += contentBuffer.toString().split('\n').length;
                contentString = contentBuffer.toString();
            }
            outputString += `
### File: ${filePath} (Modified: ${getModifiedTimeString(fileState)})
${ext === '.md' ? '````' : '```'}${language}
${contentString}
${ext === '.md' ? '````' : '```'}
            `;
        }
        else if (fileState.isFile()) {
            outputString += `
### File: ${filePath}
${'```'}
File too large to include (over 16KB)
${'```'}
            `;
        }
    });
    outputString += `
## Summary
- Total files: ${filePathArray.length}
- Total lines: ${lineCount}
`;
    return outputString;
}
//# sourceMappingURL=main.js.map
```
            
### File: build/src/main.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"main.js","sourceRoot":"","sources":["../../src/main.ts"],"names":[],"mappings":"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"}
```
            
### File: build/__tests__/unit/main.test.js (Modified: 2025-10-10 13:44:56)
```JavaScript
/* eslint-disable vitest/no-commented-out-tests */
// import { describe, it, afterEach, beforeEach, vi, expect } from 'vitest';
// import { Delays, greeter } from '../../src/main.js';
export {};
// describe('greeter function', () => {
//   const name = 'John';
//   beforeEach(() => {
//     // Read more about fake timers
//     // https://vitest.dev/api/vi.html#vi-usefaketimers
//     vi.useFakeTimers();
//   });
//   afterEach(() => {
//     vi.useRealTimers();
//     vi.restoreAllMocks();
//   });
//   // Assert if setTimeout was called properly
//   it('delays the greeting by 2 seconds', async () => {
//     vi.spyOn(global, 'setTimeout');
//     const p = greeter(name);
//     await vi.runAllTimersAsync();
//     await p;
//     expect(setTimeout).toHaveBeenCalledTimes(1);
//     expect(setTimeout).toHaveBeenLastCalledWith(
//       expect.any(Function),
//       Delays.Long,
//     );
//   });
//   // Assert greeter result
//   it('greets a user with `Hello, {name}` message', async () => {
//     const p = greeter(name);
//     await vi.runAllTimersAsync();
//     expect(await p).toBe(`Hello, ${name}`);
//   });
// });
//# sourceMappingURL=main.test.js.map
```
            
### File: build/__tests__/unit/main.test.js.map (Modified: 2025-10-10 13:44:56)
```
{"version":3,"file":"main.test.js","sourceRoot":"","sources":["../../../__tests__/unit/main.test.ts"],"names":[],"mappings":"AAAA,kDAAkD;AAClD,4EAA4E;AAC5E,uDAAuD;;AAEvD,uCAAuC;AACvC,yBAAyB;AAEzB,uBAAuB;AACvB,qCAAqC;AACrC,yDAAyD;AACzD,0BAA0B;AAC1B,QAAQ;AAER,sBAAsB;AACtB,0BAA0B;AAC1B,4BAA4B;AAC5B,QAAQ;AAER,gDAAgD;AAChD,yDAAyD;AACzD,sCAAsC;AACtC,+BAA+B;AAE/B,oCAAoC;AACpC,eAAe;AAEf,mDAAmD;AACnD,mDAAmD;AACnD,8BAA8B;AAC9B,qBAAqB;AACrB,SAAS;AACT,QAAQ;AAER,6BAA6B;AAC7B,mEAAmE;AACnE,+BAA+B;AAC/B,oCAAoC;AAEpC,8CAA8C;AAC9C,QAAQ;AACR,MAAM"}
```
            
## Summary
- Total files: 18
- Total lines: 559
