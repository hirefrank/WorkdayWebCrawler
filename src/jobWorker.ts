import { JobPosting } from './crawler.ts'

export interface JobPostingInfo {
  id: string
  title: string
  jobDescription: string
  location: string
  postedOn: string
  startDate: string
  timeType: string
  jobReqId: string
  jobPostingId: string
  country: {
    descriptor: string
    id: string
  }
}

// @ts-ignore: property does not exist
self.onmessage = async ( { data: job } : { data: JobPosting } ) : void =>
{
  const details = await fetchJobDetails(job)

  if ( ! details || ! details.id ) {
    // @ts-ignore: property does not exist
    self.postMessage(undefined)
    return void self.close()
  }

  // @ts-ignore: property does not exist
  self.postMessage(details)

  self.close()
}

export const fetchJobDetails = ( job: JobPosting ) : Promise<JobPostingInfo|undefined> =>
  fetch(job._fullUrl as string, {
    method: 'GET',
    headers: {
      'accept': 'application/json,application/xml',
    },
  })
    .then(res => res.json())
    .then(info => info.jobPostingInfo)
    .catch(err => void console.error(err) || undefined)
