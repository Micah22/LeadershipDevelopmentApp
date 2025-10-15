# Database Setup Guide

This guide will help you set up a Supabase database for your Leadership Development application.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `leadership-development`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xyz.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 3: Configure Your Application

1. Open `database/config.js`
2. Replace these values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
   ```

### Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to create all tables

### Step 5: Migrate Your Data

1. Open your application in the browser
2. Open Developer Console (F12)
3. Run this command:
   ```javascript
   // Load the migration script
   const script = document.createElement('script');
   script.src = 'database/migrate.js';
   document.head.appendChild(script);
   
   // Run migration after script loads
   script.onload = () => {
       window.dataMigration.migrateAllData().then(() => {
           console.log('Migration completed!');
       });
   };
   ```

## 🔧 Advanced Configuration

### Row Level Security (RLS)

The database includes Row Level Security policies that:
- Users can only see their own data
- Admins can manage all modules
- Everyone can view active modules

### Authentication (Optional)

To enable proper authentication:

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your authentication providers
3. Update the RLS policies in `schema.sql`

### Backup & Recovery

Supabase automatically backs up your data, but you can also:

1. **Export data**: Go to **Database** → **Backups**
2. **Import data**: Use the SQL Editor to run INSERT statements

## 📊 Database Schema

### Tables Created:

- **`users`** - User accounts and roles
- **`modules`** - Learning modules and content
- **`module_checklist`** - Task lists for each module
- **`user_progress`** - Individual progress tracking
- **`module_files`** - File attachments
- **`performance_reviews`** - Performance review data

### Key Features:

- ✅ **UUID Primary Keys** - Secure, unique identifiers
- ✅ **Foreign Key Constraints** - Data integrity
- ✅ **Indexes** - Fast queries
- ✅ **Row Level Security** - Data protection
- ✅ **Timestamps** - Track creation/updates

## 🚨 Important Notes

### Data Migration:
- The migration script will **NOT** delete your localStorage data
- You can run it multiple times safely
- Test thoroughly before clearing localStorage

### Security:
- The anon key is safe to use in frontend code
- RLS policies protect your data
- Consider enabling authentication for production

### Performance:
- Supabase has generous free tier limits
- Database queries are optimized with indexes
- File storage is handled separately (if needed)

## 🆘 Troubleshooting

### Common Issues:

**"Database not configured" warning:**
- Check that you've updated the config.js file with your credentials

**Migration fails:**
- Ensure the database schema is created first
- Check browser console for specific error messages

**Data not appearing:**
- Verify RLS policies allow your operations
- Check that data was actually inserted (use Supabase dashboard)

### Getting Help:

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Join Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
3. Check your project logs in Supabase dashboard

## 🎯 Next Steps

After setup:

1. **Test the migration** with a small dataset first
2. **Update your frontend** to use the database service
3. **Enable authentication** for production use
4. **Set up monitoring** in Supabase dashboard
5. **Configure backups** and disaster recovery

Your application will now have a robust, scalable database backend! 🎉
