import * as cdk from '@aws-cdk/core'
import * as sst from '@serverless-stack/resources'
import * as ssm from '@aws-cdk/aws-ssm'

import { createDatabase } from '@resources/database'
import { createBus } from '@resources/bus'
import { createApi } from '@resources/api'
import { createE2ETestResources } from '@resources/e2e-test-resources'

class Stack extends sst.Stack {
  #app: sst.App

  constructor(app: sst.App, id: string, props?: sst.StackProps) {
    super(app, id, props)
    this.#app = app

    app.setDefaultRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    const table = createDatabase(this)
    const bus = createBus(this)
    const api = createApi(this, table, bus)

    if (this.stage !== 'prod') {
      createE2ETestResources(this, bus)
    }

    this.addOutputsToSSM({
      REGION: app.region,
      STAGE: app.stage,
      TABLE_NAME: table.tableName,
      BUS_NAME: bus.eventBusName,
      API_ENDPOINT: api.httpApi.apiEndpoint,
    })
  }

  addOutputsToSSM(outputs: Parameters<typeof this.addOutputs>[0]) {
    const ssmPrefix = `/${this.#app.name}/${this.stage}`

    for (const [key, value] of Object.entries(outputs)) {
      const ssmParameterKey = `${ssmPrefix}/${key}`
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

  logicalPrefixedName(logicalName: string) {
    return this.#app.logicalPrefixedName(logicalName)
  }
}

export { Stack }
