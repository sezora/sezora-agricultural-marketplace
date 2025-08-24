// Database cleanup script
// Run with: node scripts/cleanup-db.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...')
    
    // Delete all records from related tables first (to avoid foreign key constraints)
    const tables = ['applications', 'messages', 'jobs', 'users']
    
    for (const table of tables) {
      console.log(`Deleting from ${table}...`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 'fake-id-to-delete-all') // This will delete all rows
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error.message)
      } else {
        console.log(`✓ Cleared ${table}`)
      }
    }
    
    // Delete from auth.users (this requires service role key)
    console.log('Deleting auth users...')
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError.message)
      return
    }
    
    for (const user of users.users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        console.error(`Error deleting user ${user.email}:`, error.message)
      } else {
        console.log(`✓ Deleted user: ${user.email}`)
      }
    }
    
    console.log('✅ Database cleanup complete!')
    
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

cleanupDatabase()