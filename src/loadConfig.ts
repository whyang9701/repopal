// scripts/configUtil.ts
import * as fs from 'fs'
import * as path from 'path'
import * as toml from '@iarna/toml'

const CONFIG_FILENAME = '.repopal-config.toml'

export interface RepopalConfig {
  output?: string
  include?: string
  exclude?: string
  recent?: number
  preview?: number
}

/**
 * Load TOML config file from current directory if it exists
 * @param cwd Current working directory
 * @returns Parsed config object or empty object if file doesn't exist
 * @throws Error if TOML file exists but cannot be parsed
 */
export function loadConfig(cwd: string = process.cwd()): RepopalConfig {
  const configPath = path.join(cwd, CONFIG_FILENAME)
  
  // If config file doesn't exist, return empty config
  if (!fs.existsSync(configPath)) {
    return {}
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8')
    const parsed = toml.parse(configContent) as RepopalConfig
    
    // Return only the config object, ignoring any unrecognized options
    // This allows for future extensibility
    return parsed
  } catch (error) {
    console.error(`Error: Failed to parse ${CONFIG_FILENAME}`)
    console.error(error.message)
    process.exit(1)
  }
}

