import { Command } from 'https://deno.land/x/cliffy@v0.24.2/command/mod.ts'
import { join } from 'https://deno.land/std@0.144.0/path/mod.ts'
import { getJobPostings, processJobPostings } from './crawler.ts'

export interface CliArguments {
  url: string
  dest: string
  threads: number
  verbose?: boolean
}

export default ( baseDir: string ) => new Command()
  .name('Workday web crawler')
  .version('0.1')
  .description('Workday web crawler CLI')
  .option('-u, --url <url:string>', 'Job Posting URL', {
    default: 'https://mastercard.wd1.myworkdayjobs.com/wday/cxs/mastercard/CorporateCareers/jobs' as const,
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
  .action(async (options) =>
  {
    const { url, dest, threads, verbose=false } : CliArguments = options

    if ( threads <= 0 )
      throw Error('threads value cannot be less than/equal to zero')
/*
      const limit:number = 20
      const pages:number = total/limit;
      
      const input : RequestInput = {appliedFacets: {}, limit: 20, offset: 0, searchText: ''}
          , response = await getListUrlContents(url, input)
          
      const jobPostings: any = response?.jobPostings || {};
      const total: number = response?.total || 0;
*/
    
    const limit: number = 20;    
    const fetch = await getJobPostings({ url, offset: 0, verbose, limit });
    const totalPages: number = Math.ceil(fetch.total/limit);

    verbose && console.log('-------------------------------------------')
    verbose && console.log(`There are ${fetch.total} job postings.`)
    verbose && console.log(`Crawling in batches of ${limit}; ${totalPages} pages total.`)
    verbose && console.log('-------------------------------------------')

    await processJobPostings({ jobPostings: fetch.jobPostings, url, dest: join(baseDir, dest), threads, verbose });
    
    if (totalPages > 1) {
      for (let i = 1; i < totalPages; i++) {
        const offset: number = i * limit;
        const current = await getJobPostings({ url, offset, verbose, limit });
        const postings = current.jobPostings;

        verbose && console.log('---------')
        verbose && console.log(`Fetching page ${i+1} of ${totalPages}..`)
        verbose && console.log(`Fetching jobs ${offset}-${offset+limit}..`)

        await processJobPostings({ jobPostings: postings, url, dest: join(baseDir, dest), threads, verbose });
      }
    }

  })
  .parse(Deno.args)
