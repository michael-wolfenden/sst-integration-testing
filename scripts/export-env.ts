import yargs from 'yargs/yargs'
import {
  SSMClient,
  GetParametersByPathCommand,
  ParameterType,
} from '@aws-sdk/client-ssm'
import { writeFile } from 'fs/promises'

import sst from '../sst.json'

const appName = sst.name
const defaultStage = 'dev'

const { stage } = yargs(process.argv.slice(2))
  .usage('Usage: $0 --stage [string]')
  .example(
    '$0 dev',
    `Generates an .env file with all the ssm variables found under path /${appName}/dev`
  )
  .default('stage', defaultStage)
  .help().argv

type Parameter = {
  name: string
  value?: string
}

const main = async () => {
  const client = new SSMClient({})
  const path = `/${appName}/${stage}/`

  console.log(`Getting parameters for path: ${path}`)

  const response = await client.send(
    new GetParametersByPathCommand({
      Path: path,
    })
  )

  const parameters = (response.Parameters || [])
    .filter((parameter) => parameter.Type !== ParameterType.SECURE_STRING)
    .map((parameter) => {
      const path = parameter.Name || ''
      return {
        name: path.substring(path.lastIndexOf('/') + 1),
        value: parameter.Value,
      }
    })

  if (parameters.length == 0)
    throw new Error(`Found no ssm parameters in path: ${path}`)

  console.log('Generating .env with the following parameters:')
  console.table(parameters)

  await writeEnvFile(parameters)
}

const writeEnvFile = async (parameters: Parameter[]) => {
  const fileContents = `
  ${parameters.reduce(
    (contents, { name, value }) => `${contents}\n${name}=${value}`,
    ''
  )}`.trim()

  await writeFile('.env', fileContents)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
