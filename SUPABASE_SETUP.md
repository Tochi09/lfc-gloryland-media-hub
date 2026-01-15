# Supabase Setup Guide for LFC Gloryland Media Hub

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with your email
3. Create a new project
4. Note your `Project URL` and `API Key` (anon/public key)

## Step 2: Create Database Tables

### Execute these SQL queries in Supabase SQL Editor:

```sql
-- Site Settings Table
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  brand_name TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  footer_description TEXT,
  footer_address TEXT,
  footer_phone TEXT,
  footer_email TEXT,
  footer_copyright TEXT,
  facebook_link TEXT,
  twitter_link TEXT,
  instagram_link TEXT,
  youtube_link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Folders Table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Files Table
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  folder_id TEXT REFERENCES folders(id),
  file_type TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Featured Media Table
CREATE TABLE featured_media (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES files(id),
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Slider Images Table
CREATE TABLE slider_images (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Step 3: Set Netlify Environment Variables

1. Go to your Netlify site settings
2. Navigate to **Environment**
3. Add these variables:
   - `SUPABASE_URL`: Your project URL from Supabase
   - `SUPABASE_KEY`: Your anon/public API key

## Step 4: Deploy

```bash
npm install
netlify deploy --prod
```

## Frontend Integration
Update your frontend to call these endpoints:
- POST `/api/login` - Login
- GET/PUT `/api/settings` - Manage settings
- GET/POST/PUT/DELETE `/api/categories` - Manage categories
- GET/POST/PUT/DELETE `/api/files` - Manage files
- GET/POST/PUT/DELETE `/api/folders` - Manage folders
- GET/POST/DELETE `/api/announcements` - Manage announcements

Include `x-user-level` header for permission checks.
