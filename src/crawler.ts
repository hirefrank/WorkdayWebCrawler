import { CliArguments } from './cli.ts'

export const getJobPostings = ({ url, dest, threads, verbose } : CliArguments) : void =>
{
  console.log('url', url)
  console.log('dest', dest)
  console.log('threads', threads)
  console.log('verbose', verbose)
}