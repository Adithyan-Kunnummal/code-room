import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variable(s)'
    )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)

export default supabase