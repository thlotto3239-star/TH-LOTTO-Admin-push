const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ygopnjbvccenryejqmlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('--- Checking Supabase Data ---')
  
  const { data: betTypes, error: e1 } = await supabase.from('instant_bet_types').select('*')
  if (e1) console.log('Error fetching instant_bet_types:', e1.message)
  else console.log(`instant_bet_types: ${betTypes.length} rows found.`)
  
  const { data: draws, error: e2 } = await supabase.from('instant_draws').select('*').limit(5)
  if (e2) console.log('Error fetching instant_draws:', e2.message)
  else console.log(`instant_draws: ${draws.length} rows found.`)
  
  const { data: bets, error: e3 } = await supabase.from('instant_bets').select('*').limit(5)
  if (e3) console.log('Error fetching instant_bets:', e3.message)
  else console.log(`instant_bets: ${bets.length} rows found.`)

  const { data: wallets, error: e4 } = await supabase.from('wallets').select('*').limit(5)
  if (e4) console.log('Error fetching wallets:', e4.message)
  else console.log(`wallets: ${wallets.length} rows found.`)
}

checkData()
