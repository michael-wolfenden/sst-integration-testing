import faker from 'faker'
import { loadEnv, str } from '@/lib/env'

test('str returns environment variable if present', () => {
  const randomString = faker.random.alphaNumeric(10)
  const stubProcessEnv = { SOME_ENV_VARIABLE: randomString }

  const actual = loadEnv({ SOME_ENV_VARIABLE: str() }, stubProcessEnv)
  expect(actual.SOME_ENV_VARIABLE).toStrictEqual(randomString)
})

test('str throws if environment variable is not present', () => {
  const loadingAMissingVariable = () =>
    loadEnv({ MISSING_ENV_VARIABLE: str() }, {})

  expect(loadingAMissingVariable).toThrow(
    `Environment variable 'MISSING_ENV_VARIABLE' was not defined and no default was provided`
  )
})

test('str allows defaulting environment variable if not present', () => {
  const randomFallback = faker.random.alphaNumeric(10)

  const actual = loadEnv({ MISSING_ENV_VARIABLE: str(randomFallback) }, {})
  expect(actual.MISSING_ENV_VARIABLE).toStrictEqual(randomFallback)
})
