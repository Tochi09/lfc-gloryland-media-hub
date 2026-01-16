-- LFC Gloryland Media Hub - Complete Database Schema
-- Run all these queries in your Supabase SQL Editor

-- ========== SITE SETTINGS TABLE ==========
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  brand_name TEXT DEFAULT 'LFC GLORYLAND',
  hero_title TEXT DEFAULT 'GLORYLAND<br>MEDIA HUB',
  hero_subtitle TEXT DEFAULT 'Access sermons, worship moments, and spiritual resources.',
  footer_description TEXT DEFAULT 'Spreading God''s word through digital media and community outreach.',
  footer_address TEXT DEFAULT '123 Faith Street, Gloryland',
  footer_phone TEXT DEFAULT '(555) 123-4567',
  footer_email TEXT DEFAULT 'info@lfcgloryland.com',
  footer_copyright TEXT DEFAULT '© 2026 LFC Gloryland Media Hub. All rights reserved.',
  facebook_link TEXT DEFAULT '#',
  twitter_link TEXT DEFAULT '#',
  instagram_link TEXT DEFAULT '#',
  youtube_link TEXT DEFAULT '#',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== CATEGORIES TABLE ==========
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'fas fa-layer-group',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== FOLDERS TABLE ==========
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== FILES TABLE ==========
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'image',
  thumbnail TEXT,
  tags TEXT,
  likes INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT true,
  uploaded_by TEXT DEFAULT 'Admin',
  upload_date TIMESTAMP DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== ANNOUNCEMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  date TEXT,
  highlight BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========== FEATURED MEDIA TABLE ==========
CREATE TABLE IF NOT EXISTS featured_media (
  id TEXT PRIMARY KEY,
  file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  tags TEXT,
  likes INTEGER DEFAULT 0,
  position INTEGER,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========== SLIDER IMAGES TABLE ==========
CREATE TABLE IF NOT EXISTS slider_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========== STAFF MEMBERS TABLE ==========
CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  added_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX IF NOT EXISTS idx_folders_category_id ON folders(category_id);
CREATE INDEX IF NOT EXISTS idx_files_category_id ON files(category_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_featured_media_created_at ON featured_media(created_at);

-- ========== INSERT DEFAULT DATA ==========

-- Insert default site settings
INSERT INTO site_settings (brand_name, hero_title, hero_subtitle, footer_description, footer_address, footer_phone, footer_email, footer_copyright, facebook_link, twitter_link, instagram_link, youtube_link)
VALUES (
  'LFC GLORYLAND',
  'GLORYLAND<br>MEDIA HUB',
  'Access sermons, worship moments, and spiritual resources.',
  'Spreading God''s word through digital media and community outreach.',
  '123 Faith Street, Gloryland',
  '(555) 123-4567',
  'info@lfcgloryland.com',
  '© 2026 LFC Gloryland Media Hub. All rights reserved.',
  '#',
  '#',
  '#',
  '#'
)
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO categories (id, name, icon)
VALUES 
  ('cat_1', 'Photos', 'fas fa-camera'),
  ('cat_2', 'Videos', 'fas fa-video'),
  ('cat_3', 'Audio', 'fas fa-headphones'),
  ('cat_4', 'PDFs', 'fas fa-file-pdf')
ON CONFLICT DO NOTHING;

-- ========== ENABLE ROW LEVEL SECURITY (Optional but Recommended) ==========
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE featured_media ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- ========== CREATE POLICIES (Optional - Uncomment if using RLS) ==========
-- Allow public read access to most tables
-- CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON folders FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON files FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON announcements FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON featured_media FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON slider_images FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON site_settings FOR SELECT USING (true);
