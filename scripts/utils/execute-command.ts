import spawn from 'cross-spawn'

export const executeCommand = (
  ...[command, args, options]: Parameters<typeof spawn>
) => {
  const child = spawn(command, args, options)

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) return resolve()

      const argsJoined = (args || []).join(' ')
      const message = `${command} ${argsJoined} failed with exit code ${code}.`

      return reject(new Error(message))
    })
  })
}
