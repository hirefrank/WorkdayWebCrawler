import { Command } from 'https://deno.land/x/cliffy@v0.24.2/command/mod.ts'
import { getJobPostings } from './crawler.ts'

export interface CliArguments {
  url: string,
  dest: string,
  threads: number,
  verbose?: boolean,
}

export default () => new Command()
  .name('Workday web crawler')
  .version('0.1')
  .description('Workday web crawler CLI')
  .option('-u, --url <url:string>', 'Job Posting URL', {
    default: 'https://mastercard.wd1.myworkdayjobs.com/CorporateCareers' as const,
    required: true,
  })
  .option('-d, --dest <dest:string>', 'Destination Directory', {
    default: './test' as const,
    required: true,
  })
  .option('-t, --threads <threads:number>', 'Number of parallel threads', {
    default: 4 as const,
    required: true,
  })
  .option('-v, --verbose', 'Verbose output to sdout')
  .action((options) =>
  {
    const { url, dest, threads, verbose=false } : CliArguments = options

    if ( threads <= 0 )
      throw Error('threads value cannot be less than/equal to zero')

    getJobPostings({ url, dest, threads, verbose })
  })
  .parse(Deno.args)
