import { dirname } from 'https://deno.land/std@0.144.0/path/mod.ts'
import cli from './src/cli.ts'

await cli(dirname(new URL('', import.meta.url).pathname))
