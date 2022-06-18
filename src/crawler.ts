import { CliArguments } from './cli.ts'
import { ensureDir } from 'https://deno.land/std@0.144.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.144.0/path/mod.ts'
import { JobPostingInfo } from './jobWorker.ts'

export interface JobPosting {
  title: string
  externalPath: string
  locationsText: string
  postedOn: string
  bulletFields: string[]
  _fullUrl?: string
}

export interface JsonResponseBody {
  total: number
  jobPostings: JobPosting[]
}

export interface RequestInput {
  appliedFacets: object
  limit: number
  offset: number
  searchText: string
}

export const getJobPostings = async ({ url, dest, threads, verbose } : CliArguments) : Promise<void> =>
{
  verbose && console.log('Scraping list of all job postings..')

  const input : RequestInput = {appliedFacets: {}, limit: 20, offset: 0, searchText: ''}
      , response = await getListUrlContents(url, input)
      , { jobPostings=[] } = response || {}
  
  verbose && console.log(`There are ${jobPostings.length} job postings.`)
  verbose && console.log('Scraping full descriptions of each job posting..')

  if ( 0 == jobPostings.length)
    return

  for ( let i=0; i<jobPostings.length; i++ ) {
    const urlObj = new URL(url)
    jobPostings[i]._fullUrl = [urlObj.origin, urlObj.pathname].join('')
      .replace(/\/jobs\/{0}$/g, jobPostings[i].externalPath)
  }

  // maybe create destination folder
  await ensureDir(dest)

  // run with --no-check if deno takes longer to re-check the worker file on every worker invocation
  for (let i=0; i<jobPostings.length; i+=threads) {
    const jobs = jobPostings.slice(i, i+threads).map((post,i) =>
    {
      return new Promise<JobPostingInfo|undefined>(resolve =>
        {
          const worker = new Worker(new URL('./jobWorker.ts', import.meta.url).href, { type: 'module' })
          worker.postMessage(post)
          worker.onmessage = ({ data } : { data: JobPostingInfo|undefined }) => resolve(data)
        })
    })

    const results = (await Promise.allSettled(jobs)) as PromiseFulfilledResult<any>[]

    const writes: Promise<void>[] = []
    
    results.forEach((res) => writes.push(new Promise<void>(async resolve =>
    {
      const info = res.value as JobPostingInfo|undefined

      if ( ! info || ! info.id )
        return void resolve()

      const jobfile = join(dest, info.id.concat('.json'))
      await Deno.writeTextFile(jobfile, JSON.stringify(info))

      resolve()
    })))

    await Promise.allSettled(writes)
  }

  verbose && console.log(`Done. All files stored under ${dest}`)
}

export const getListUrlContents = ( url: string, input: RequestInput ) : Promise<JsonResponseBody|undefined> =>
  fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json,application/xml',
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })
    .then(res => res.json())
    .catch(err => void console.error(err) || undefined)
