export interface PollOptions<T> {
  asyncFn: () => PromiseLike<T>
  conditionFn: (value: T) => boolean
  intervalMs?: number
  timeoutMs?: number
}

export interface PollResult<T> {
  lastResult: T
  found: boolean
}

export const poll = async <T>({
  asyncFn,
  conditionFn,
  intervalMs,
  timeoutMs,
}: PollOptions<T>): Promise<PollResult<T>> => {
  const interval = intervalMs ?? 500
  const timeout = timeoutMs ?? 2_500

  let result = await asyncFn()

  let totalTime = 0
  while (!conditionFn(result)) {
    if (totalTime > timeout) return { lastResult: result, found: false }
    await new Promise((resolve) => setTimeout(resolve, interval))
    result = await asyncFn()
    totalTime += interval
  }

  return { lastResult: result, found: true }
}
