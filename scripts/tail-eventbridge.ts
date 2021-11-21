import { loadEnv, str } from '@/lib/env'
import * as dotenv from 'dotenv'
import { executeCommand } from 'scripts/utils/execute-command'

dotenv.config()

const env = loadEnv({
  BUS_NAME: str(),
  REGION: str(),
})

const main = async () => {
  const args = [
    'tail-eventbridge-bus',
    '--region',
    env.REGION,
    '--eventBusName',
    env.BUS_NAME,
  ]

  await executeCommand('npx', ['lumigo-cli', ...args], {
    stdio: 'inherit',
    env: process.env,
  })
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
