import * as sst from '@serverless-stack/resources'
import { Stack } from '@resources/Stack'

export default function main(app: sst.App): void {
  new Stack(app, 'stack')
}
