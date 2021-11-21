type Validator<Output> = (
  defaultValue?: Output
) => (processEnvKey: string, processEnvValue?: string) => Output

type Validators<EnvVariables> = {
  [Key in keyof EnvVariables]: ReturnType<Validator<EnvVariables[Key]>>
}

type AnObject = Record<string, unknown>

export const str: Validator<string> =
  (defaultValue) => (processEnvKey, processEnvValue) => {
    if (processEnvValue != null) return processEnvValue
    if (defaultValue != null) return defaultValue

    throw new Error(
      `Environment variable '${processEnvKey}' was not defined and no default was provided`
    )
  }

export const loadEnv = <EnvVariables extends AnObject>(
  validators: Validators<EnvVariables>,
  environment = process.env
): Readonly<EnvVariables> => {
  const result: Partial<EnvVariables> = {}

  for (const processEnvKey in validators) {
    const validator = validators[processEnvKey]
    result[processEnvKey] = validator(processEnvKey, environment[processEnvKey])
  }

  return result as Readonly<EnvVariables>
}
