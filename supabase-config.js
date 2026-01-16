// ========== SUPABASE CONFIGURATION ==========
// IMPORTANT: Update this file with your Supabase credentials

// Step 1: Get your Supabase credentials
// 1. Go to https://supabase.com and log in
// 2. Click on your project name (lfc-gloryland-media-hub)
// 3. Click Settings → API
// 4. Copy the Project URL (looks like: https://your-project.supabase.co)
// 5. Copy the anon public key (starts with: eyJhbGciOi...)

// Step 2: Create a storage bucket named 'media'
// 1. In Supabase dashboard, click Storage in the sidebar
// 2. Click "Create a new bucket"
// 3. Name it: media
// 4. Make it PUBLIC (important for image display)
// 5. Click Create

// Step 3: Fill in your credentials below
const SUPABASE_CONFIG = {
    // Replace with your actual Supabase Project URL
    url: 'YOUR_SUPABASE_PROJECT_URL',
    
    // Replace with your actual Supabase anon key
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Example (DO NOT USE - for reference only):
// const SUPABASE_CONFIG = {
//     url: 'https://your-project.supabase.co',
//     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...'
// };

