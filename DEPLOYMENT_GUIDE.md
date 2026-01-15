# LFC Gloryland Media Hub - Deployment Guide

## Quick Setup Checklist

### 1. Create Supabase Account
- [ ] Sign up at https://supabase.com
- [ ] Create a new project
- [ ] Copy your `Project URL` and `Anon/Public API Key`

### 2. Set Up Database
- [ ] Go to Supabase SQL Editor
- [ ] Run all SQL from `SUPABASE_SETUP.md`
- [ ] Verify all tables are created

### 3. Connect to Netlify
- [ ] Create a Netlify account or sign in
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect your Git repository (or drag & drop this folder)
- [ ] Go to Site settings → Environment
- [ ] Add these variables:
  - `SUPABASE_URL` = Your Supabase project URL
  - `SUPABASE_KEY` = Your Supabase API key

### 4. Deploy
```bash
# Install dependencies
npm install

# Deploy to Netlify
netlify deploy --prod
```

## Testing the API

### Login Test
```bash
curl -X POST https://YOUR_NETLIFY_DOMAIN/.netlify/functions/login \
  -H "Content-Type: application/json" \
  -d '{"password":"24250"}'
```

### Get Categories
```bash
curl -X GET https://YOUR_NETLIFY_DOMAIN/.netlify/functions/categories \
  -H "x-user-level: 3"
```

## File Structure

```
LFC GLORYLAND MEDIA HUB/
├── index.html              # Main HTML (includes api-client.js)
├── script.js              # Frontend logic (use api. calls)
├── style.css              # Styling
├── api-client.js          # API client library
├── package.json           # Dependencies
├── netlify.toml          # Netlify config
├── netlify/
│   └── functions/        # Serverless functions
│       ├── login.js
│       ├── settings.js
│       ├── categories.js
│       ├── files.js
│       ├── folders.js
│       └── announcements.js
└── SUPABASE_SETUP.md     # Database setup instructions
```

## API Endpoints Reference

All endpoints require `x-user-level` header for permission checking.

### Authentication
- **POST** `/api/login` - Login with password

### Settings
- **GET** `/api/settings` - Get all settings
- **PUT** `/api/settings` - Update settings (Level 2+)

### Categories
- **GET** `/api/categories` - Get all categories
- **POST** `/api/categories` - Create category (Level 2+)
- **PUT** `/api/categories` - Update category (Level 2+)
- **DELETE** `/api/categories?id=X` - Delete category (Level 2+)

### Files
- **GET** `/api/files` - Get all files
- **POST** `/api/files` - Upload file (Level 1+)
- **PUT** `/api/files` - Update file (Level 2+)
- **DELETE** `/api/files?id=X` - Delete file (Level 2+)

### Folders
- **GET** `/api/folders` - Get all folders
- **POST** `/api/folders` - Create folder (Level 1+)
- **PUT** `/api/folders` - Update folder (Level 2+)
- **DELETE** `/api/folders?id=X` - Delete folder (Level 2+)

### Announcements
- **GET** `/api/announcements` - Get all announcements
- **POST** `/api/announcements` - Create announcement (Level 2+)
- **DELETE** `/api/announcements?id=X` - Delete announcement (Level 2+)

## Updating Frontend to Use APIs

Replace storage calls with API calls:

### Before (localStorage):
```javascript
const catData = await window.storage.get('categories');
categories = JSON.parse(catData.value);
```

### After (API):
```javascript
const result = await api.getCategories();
categories = result.data;
```

The `api-client.js` file provides these methods:
- `api.login(password)`
- `api.getSettings()`, `api.updateSettings()`
- `api.getCategories()`, `api.createCategory()`, `api.updateCategory()`, `api.deleteCategory()`
- `api.getFiles()`, `api.createFile()`, `api.updateFile()`, `api.deleteFile()`
- `api.getFolders()`, `api.createFolder()`, `api.updateFolder()`, `api.deleteFolder()`
- `api.getAnnouncements()`, `api.createAnnouncement()`, `api.deleteAnnouncement()`

## Passwords
- **Level 3 (Full Access)**: `24250`
- **Level 2 (Moderate Access)**: `god is with us`
- **Level 1 (Basic Access)**: `god is here`
