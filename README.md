# WebCrawler
OVERVIEW:
<br />
This is a web crawler intended to scrape job postings given a workday job postings URL. The files are stored by job posting ID, and contain a json with a detailed description of the posting from the given sub-urls, as well as notable labels pulled from the original posting description containing info like job title, location, posted date in a list.
<br />
Once we get all job URLs on the first page, retrieving the details of each job posting from branching URLs can be done in parallel (see options below).
<br />
The crawler has been successfully tested with 3 different workday job posting websites. It should readily expand to more!

<br /><br />


CONTENTS:
<br />
- crawler.py
<br /> main logic for scraping workday job postings, as well as starting the main program
- util.py
<br />  utility functions used by the crawler. not crawler dependent

<br /><br />
USAGE:      python3 crawler.py <options>
EXAMPLES:   
- (1) python3 crawler.py -u "https://mastercard.wd1.myworkdayjobs.com/CorporateCareers" -d "./mastercard"
<br /> retrieves all job postings for mastercard and saves them under the local directory 'mastercard'
- (2) python3 crawler.py -u "https://symantec.wd1.myworkdayjobs.com/careers" -d "./symantec"
<br /> retrieve all job postings for symantec
- (3) python3 crawler.py -u "https://pvh.wd1.myworkdayjobs.com/PVH_Careers" -d "./pvh" -t 8 --verbose
<br /> retrieve all job postings for PVH, using 8 parallel threads and a verbose output


Options:

- -h, --help
show this help message and exit

- -u MAIN_LINK, --url=MAIN_LINK
Job Posting URL 
[Default: https://mastercard.wd1.myworkdayjobs.com/CorporateCareers]

- -d DEST_DIR, --dest=DEST_DIR
Destination Directory 
[Default: ./test]

- -t THREAD_COUNT, --threads=THREAD_COUNT
Number of parallel threads 
[Default: 4]

- -v, --verbose
Verbose output to sdout 
[Default: False]

  
## Run with Deno
  
```sh
$ deno run index.ts --help
  Usage:   Workday web crawler
  Version: 0.1                

  Description:

    Workday web crawler CLI

  Options:

    -h, --help                - Show this help.                                                         
    -V, --version             - Show the version number for this program.                               
    -u, --url      <url>      - Job Posting URL                            (required, Default:          
                                                                           "https://mastercard          
                                                                           .wd1.myworkdayjobs.com/wday/c
                                                                           xs/mastercard/CorporateCareer
                                                                           s/jobs")                     
    -d, --dest     <dest>     - Destination Directory                      (required, Default: "./test")
    -t, --threads  <threads>  - Number of parallel threads                 (required, Default: 4)       
    -v, --verbose             - Verbose output to sdout                                                 

```
  
You'll need to run with the following flags to grant net/fs permissions:
1. `--allow-net` - this allows fetch requests to load external URLs
2. `--allow-read` - allow reading files, so the worker code can be imported
3. `--allow-write` - allow writing files, so your job exports will be saved
  
In addition to that, you may run with `--no-check` to skip type checking and save time, because deno will check the worker file for every thread invocation, as the file gets imported.
  
### Examples
  
```sh
# run with 10 threads and verbose mode
deno run --allow-net --allow-read --allow-write --no-check index.ts -t 10 -v
```