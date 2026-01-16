-- Fix existing tables in Supabase
-- Run these commands in your Supabase SQL Editor if the tables already exist

-- Fix slider_images table - convert id to auto-increment
ALTER TABLE slider_images DROP CONSTRAINT slider_images_pkey;
ALTER TABLE slider_images ADD PRIMARY KEY (id);
ALTER TABLE slider_images ALTER COLUMN id SET DEFAULT nextval('slider_images_id_seq');

-- If the sequence doesn't exist, create it
CREATE SEQUENCE IF NOT EXISTS slider_images_id_seq;
ALTER TABLE slider_images ALTER COLUMN id SET DEFAULT nextval('slider_images_id_seq');
ALTER SEQUENCE slider_images_id_seq OWNED BY slider_images.id;

-- Fix announcements table - convert id to auto-increment
ALTER TABLE announcements DROP CONSTRAINT announcements_pkey;
ALTER TABLE announcements ADD PRIMARY KEY (id);
ALTER TABLE announcements ALTER COLUMN id SET DEFAULT nextval('announcements_id_seq');

-- If the sequence doesn't exist, create it
CREATE SEQUENCE IF NOT EXISTS announcements_id_seq;
ALTER TABLE announcements ALTER COLUMN id SET DEFAULT nextval('announcements_id_seq');
ALTER SEQUENCE announcements_id_seq OWNED BY announcements.id;
