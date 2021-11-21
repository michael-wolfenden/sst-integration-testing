import * as cdk from '@aws-cdk/core'
import * as sst from '@serverless-stack/resources'
import * as ssm from '@aws-cdk/aws-ssm'

import { createDatabase } from '@resources/database'

class Stack extends sst.Stack {
  ssmPrefix: string

  constructor(app: sst.App, id: string, props?: sst.StackProps) {
    super(app, id, props)
    this.ssmPrefix = `/${app.name}/${this.stage}`

    const removalPolicy = cdk.RemovalPolicy.DESTROY
    const table = createDatabase(this, removalPolicy)

    this.addOutputsToSSM({
      TABLE_NAME: table.tableName,
    })
  }

  addOutputsToSSM(outputs: Parameters<typeof this.addOutputs>[0]) {
    for (const [key, value] of Object.entries(outputs)) {
      const ssmParameterKey = `${this.ssmPrefix}/${key}`
      const ssmParameterValue = typeof value === 'string' ? value : value.value

      new ssm.StringParameter(
        this,
        `${key}-ssm-parameter`.toLocaleLowerCase(),
        {
          parameterName: ssmParameterKey,
          stringValue: ssmParameterValue,
          tier: ssm.ParameterTier.STANDARD,
        }
      )
    }

    this.addOutputs(outputs)
  }
}

export { Stack }
