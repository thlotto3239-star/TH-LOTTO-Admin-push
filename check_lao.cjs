const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ygopnjbvccenryejqmlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnb3BuamJ2Y2NlbnJ5ZWpxbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTc2NjQsImV4cCI6MjA5MjEzMzY2NH0.aOA0zbkUtS85hb0Bz5aZO8koi2gVHmDGE7Vttv0VDME'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLaoLottery() {
  console.log('--- Checking for Lao Lottery ---')
  const { data, error } = await supabase
    .from('lottery_markets')
    .select('*')
    .ilike('name', '%ลาว%')
  
  if (error) {
    console.log('Error fetching:', error.message)
    return
  }
  
  if (data.length > 0) {
    console.log(`Found ${data.length} Lao lotteries:`)
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.log('No Lao lottery found in the database.')
  }
}

checkLaoLottery()
