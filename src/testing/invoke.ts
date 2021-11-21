import { loadEnv, str } from '@/lib/env'
import fetch from 'node-fetch'

const env = loadEnv({
  API_ENDPOINT: str(),
})

export const viaHttp = async (
  relativePath: string,
  method: 'GET' | 'DELETE' | 'POST' | 'PUT' = 'GET',
  body?: string
) => {
  const relativePathNoLeadingSlash = relativePath.startsWith('/')
    ? relativePath.substring(1)
    : relativePath

  const url = `${env.API_ENDPOINT}/${relativePathNoLeadingSlash}`
  const setContentTypeToJson = method === 'POST' || method === 'PUT'

  const headers = {
    ...(setContentTypeToJson && { 'Content-Type': 'application/json' }),
  }

  const response = await fetch(url, {
    method,
    body,
    headers,
  })

  const responseBody =
    response.headers.get('content-type') == 'application/json'
      ? await response.json()
      : await response.text()

  return {
    statusCode: response.status,
    body: responseBody,
  }
}
