/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */
const fs = require('fs')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const semver = require('semver')

const argv = yargs(hideBin(process.argv)).argv

const extendsConf = (api, conf) => {
  let envfile = '.env' // default

  if (argv.environment) {
    const envKey = `env_${argv.environment}`

    if (api.prompts[envKey]) envfile = api.prompts[envKey]
    else envfile = `.env.${argv.environment}`
  }

  if (!envfile.length) return

  const path = api.resolve.app(envfile)

  if (!fs.existsSync(path)) {
    console.log(`APP EXTENSION (multienv): '${envfile}' file missing: skipping`)
    return
  }

  const envOptions = { encoding: 'utf8', path }

  const { config } = require('dotenv')
  const { parsed } = config(envOptions)

  const version = api.getPackageVersion('@quasar/app')
  const v1 = semver.lt(version, '2.0.0')

  Object.keys(parsed).forEach(key => {
    conf.build.env[key] = v1 ? JSON.stringify(parsed[key]) : parsed[key]
  })
}

module.exports = api => {
  api.compatibleWith('@quasar/app', '^1.1.0 || ^2.0.0')
  api.extendQuasarConf(conf => extendsConf(api, conf))
}