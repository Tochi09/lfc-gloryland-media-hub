-- Fix existing tables in Supabase - SIMPLE APPROACH
-- Run ONLY ONE of these options in your Supabase SQL Editor

-- ========== OPTION 1: DROP AND RECREATE (Recommended if no data) ==========
-- Use this if you don't have any hero slider images saved yet
DROP TABLE IF EXISTS slider_images CASCADE;
CREATE TABLE slider_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
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

-- ========== OPTION 2: PRESERVE DATA (If you have existing images) ==========
-- Comment out OPTION 1 above and uncomment this section instead:

-- -- Create backup of existing data
-- CREATE TEMP TABLE slider_images_backup AS SELECT * FROM slider_images;
-- CREATE TEMP TABLE announcements_backup AS SELECT * FROM announcements;

-- -- Drop old tables
-- DROP TABLE IF EXISTS slider_images CASCADE;
-- DROP TABLE IF EXISTS announcements CASCADE;

-- -- Recreate with proper auto-increment
-- CREATE TABLE slider_images (
--   id SERIAL PRIMARY KEY,
--   url TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE announcements (
--   id BIGSERIAL PRIMARY KEY,
--   title TEXT NOT NULL,
--   content TEXT,
--   image TEXT,
--   date TEXT,
--   highlight BOOLEAN DEFAULT false,
--   priority INTEGER DEFAULT 0,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Restore data
-- INSERT INTO slider_images (url, created_at) SELECT url, created_at FROM slider_images_backup;
-- INSERT INTO announcements (title, content, image, date, highlight, priority, created_at, updated_at) 
--   SELECT title, content, image, date, highlight, priority, created_at, updated_at FROM announcements_backup;
