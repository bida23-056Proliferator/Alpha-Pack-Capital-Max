# 🚀 Alpha Pack Capital Max — Complete Setup Guide

**Professional Student Lending Platform for Botswana**
Version 6.0 | Production-Ready

---

## 📋 Table of Contents

1. [Pre-Setup Checklist](#pre-setup-checklist)
2. [Step 1: Supabase Setup](#step-1-supabase-setup)
3. [Step 2: Create Admin Account](#step-2-create-admin-account)
4. [Step 3: Deploy to GitHub Pages](#step-3-deploy-to-github-pages)
5. [Step 4: Test Everything](#step-4-test-everything)
6. [Troubleshooting](#troubleshooting)
7. [First Login As Admin](#first-login-as-admin)

---

## ✅ Pre-Setup Checklist

- [ ] You have a Supabase project created
- [ ] Supabase URL: `https://rhrkcfalfahlshvlllwd.supabase.co`
- [ ] Supabase anon key is in `assets/js/modules/config.js`
- [ ] You have a GitHub account (free)
- [ ] Git installed on your computer
- [ ] All files in correct folder structure

---

## Step 1: Supabase Setup (5 minutes)

### 1.1 Import Database Schema

1. **Open Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL below:

```sql
-- ═══════════════════════════════════════════════════════════════
-- ALPHA PACK CAPITAL MAX — v6.0 Database Schema
-- Run this ENTIRE script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  institution TEXT,
  program TEXT,
  year_of_study INT,
  student_id_no TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  kyc_status TEXT NOT NULL DEFAULT 'not_started',
  kyc_front_url TEXT,
  kyc_back_url TEXT,
  kyc_submitted_at TIMESTAMPTZ,
  kyc_decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. LOANS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id TEXT NOT NULL,
  package_label TEXT NOT NULL,
  principal NUMERIC(10,2) NOT NULL,
  interest NUMERIC(10,2) NOT NULL,
  interest_rate NUMERIC(5,4) NOT NULL DEFAULT 0.30,
  total_repayable NUMERIC(10,2) NOT NULL,
  repayment_days INT NOT NULL DEFAULT 30,
  due_date DATE,
  purpose TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. SETTINGS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_rate_min NUMERIC(5,4) DEFAULT 0.25,
  interest_rate_max NUMERIC(5,4) DEFAULT 0.30,
  repayment_days INT DEFAULT 30,
  pkg_starter_max INT DEFAULT 500,
  pkg_boost_max INT DEFAULT 1000,
  pkg_advance_max INT DEFAULT 2000,
  pkg_premium_max INT DEFAULT 5000,
  helpdesk_phone1 TEXT DEFAULT '26776807549',
  helpdesk_phone2 TEXT DEFAULT '26778322911',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ADS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cta_url TEXT,
  cta_text TEXT DEFAULT 'Learn More',
  price_label TEXT,
  price_period TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. AUDIT LOG TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES Policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- LOANS Policies
CREATE POLICY "Users can read own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all loans"
  ON public.loans FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update loans"
  ON public.loans FOR UPDATE
  USING (is_admin());

-- SETTINGS Policies
CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (is_admin());

-- ADS Policies
CREATE POLICY "Anyone can read active ads"
  ON public.ads FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage all ads"
  ON public.ads FOR ALL
  USING (is_admin());

-- AUDIT LOG Policies
CREATE POLICY "Admins can read audit log"
  ON public.audit_log FOR SELECT
  USING (is_admin());

CREATE POLICY "Authenticated users can insert"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════
-- DEFAULT DATA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.settings DEFAULT VALUES;

INSERT INTO public.ads (title, description, cta_text, active)
VALUES (
  'Advertise to Botswana Students',
  'Reach thousands of verified student borrowers. Homepage banner slots available.',
  'Contact us',
  TRUE
);
```

4. Click **Run** (green button)
5. ✅ All tables created with RLS policies

### 1.2 Create Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**
3. **Name:** `kyc-docs`
4. **Public:** Toggle OFF (private)
5. Click **Create**
6. Click `kyc-docs` → **Policies** tab
7. Add these 3 policies:

| Policy Name | Operation | Expression |
|---|---|---|
| Users upload own | INSERT | `(auth.uid()::text = (storage.foldername(name))[1])` |
| Users read own | SELECT | `(auth.uid()::text = (storage.foldername(name))[1])` |
| Admins read all | SELECT | `is_admin()` |

### 1.3 Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. **Site URL:** `https://yourusername.github.io`
3. **Redirect URLs:** Add:
   ```
   https://yourusername.github.io/alpha-pack-capital-max/**
   ```
4. Click **Save**

✅ Supabase is ready!

---

## Step 2: Create Admin Account

### **EASY METHOD** (Recommended)

#### Option A: Via Admin Creation Page

1. Push all files to GitHub (see Step 3)
2. Visit: `https://yourusername.github.io/alpha-pack-capital-max/admin/setup.html`
3. Fill in:
   - **Email:** your@email.com
   - **Password:** Strong password (10+ chars)
   - **Confirm:** Repeat password
4. Click **Create Admin Account**
5. ✅ You're now admin!
6. **Delete `admin/setup.html`** from GitHub immediately (security)

#### Option B: Via Browser Console

1. Open your site homepage
2. Press `F12` (Developer Tools)
3. Go to **Console** tab
4. Paste this:

```javascript
const email = prompt("Admin email:");
const password = prompt("Admin password (10+ chars):");
if (password.length >= 10) {
  const { data, error } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { role: "admin" } }
  });
  if (!error) {
    alert("✅ Admin created! Go to /admin/login.html");
  } else {
    alert("❌ " + error.message);
  }
}
```

5. Follow prompts
6. ✅ Admin account created!

---

## Step 3: Deploy to GitHub Pages

### 3.1 Initialize Git Repository

```bash
# In your project folder
git init
git add .
git commit -m "Initial Alpha Pack Capital Max deployment"
```

### 3.2 Create GitHub Repository

1. Go to **github.com** → **New Repository**
2. **Name:** `alpha-pack-capital-max`
3. **Visibility:** Public
4. **Do NOT** initialize with README
5. Click **Create Repository**

### 3.3 Push to GitHub

```bash
# Copy the URL from your GitHub repo
git remote add origin https://github.com/yourusername/alpha-pack-capital-max.git
git branch -M main
git push -u origin main
```

### 3.4 Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`
4. **Folder:** `/ (root)`
5. Click **Save**
6. Wait 60 seconds...
7. ✅ Your site is live at: `https://yourusername.github.io/alpha-pack-capital-max`

---

## Step 4: Test Everything

### For Students

1. **Visit homepage**
   - URL: `https://yourusername.github.io/alpha-pack-capital-max`
   - Should load with premium UI

2. **Register**
   - Fill in all details
   - Verify email (check spam folder)
   - Log in

3. **Verify Student ID**
   - Upload photos (or use camera)
   - Submit for review

4. **Apply for Loan**
   - Select package
   - Adjust amount
   - Submit application

### For Admin

1. **First login as admin**

   **Via URL:**
   - Go to: `https://yourusername.github.io/alpha-pack-capital-max/admin/login.html`
   - Email: your@email.com
   - Password: Your password
   - Click **Login**

   **What you should see:**
   - Admin Dashboard with KPI cards
   - KYC verification queue (students to review)
   - Loan applications queue (to approve/decline)
   - Real-time statistics

2. **Approve KYC**
   - Click student in queue
   - View their Student ID photos
   - Click **Approve** or **Reject**
   - Student gets instant notification

3. **Approve Loans**
   - Check loan queue
   - View application details
   - Click **Approve** or **Decline**
   - Student sees updated status

4. **Manage Ads**
   - Go to **Ads** section
   - Create, pause, or delete ads
   - Ads appear on homepage instantly

5. **View Analytics**
   - **Dashboard:** Live KPIs
   - **Insights:** Charts & trends
   - **Users:** All registered students

---

## 🔐 Security Reminders

- ✅ HTTPS enabled (GitHub Pages)
- ✅ Passwords hashed (Supabase Auth)
- ✅ Row-Level Security active
- ⚠️ Delete `admin/setup.html` after creating admin
- ⚠️ Never share admin credentials
- ⚠️ Never commit admin API key

---

## 🐛 Troubleshooting

### "Blank page" or "404 error"

**Fix:**
- Check URL is exactly: `https://yourusername.github.io/alpha-pack-capital-max`
- Clear browser cache (Ctrl+Shift+Del)
- Wait 2 minutes for GitHub Pages to rebuild
- Check browser console (F12) for errors

### "Cannot connect to Supabase"

**Fix:**
- Verify `config.js` has correct Supabase URL
- Check Supabase project is active
- Verify GitHub Pages URL in Supabase Auth settings
- Check browser console for errors

### "Admin login fails"

**Fix:**
- Did you create the admin account? (See Step 2)
- Check email is correct
- Try resetting Supabase project
- Check browser console for error details

### "Camera doesn't work"

**Fix:**
- HTTPS required (GitHub Pages ✓)
- Browser must support camera access
- Allow camera permission when prompted
- Try different browser if one doesn't work

### "KYC upload fails"

**Fix:**
- Check file size (< 5MB)
- Ensure storage bucket `kyc-docs` exists
- Check RLS policies are configured
- File format must be image (JPG, PNG, etc)

### "Student login works but application shows 'Pending'"

**Fix:**
- Student needs KYC approved first
- As admin, go to KYC queue
- Find student and approve KYC
- Student can then apply for loans

---

## 📞 Need Help?

Check these in order:
1. SETUP_GUIDE.md (this file)
2. Browser console (F12 → Console)
3. Supabase Dashboard for database status
4. GitHub Pages deployment status

---

## ✨ Features Included

### Student Features
- ✅ Registration with institution details
- ✅ Email verification
- ✅ Student ID upload (photo + camera)
- ✅ Loan application with calculator
- ✅ Dashboard with application status
- ✅ Real-time loan calculator
- ✅ WhatsApp contact integration

### Admin Features
- ✅ KYC verification queue with photo viewer
- ✅ Loan application review queue
- ✅ Approve/decline decisions
- ✅ Business analytics with charts
- ✅ Ad management system
- ✅ Settings configuration
- ✅ Student management
- ✅ Audit logging

### Technical
- ✅ Premium modern UI/UX
- ✅ Mobile-first responsive design
- ✅ Row-Level Security
- ✅ Real-time updates
- ✅ HTTPS secure
- ✅ Supabase backend
- ✅ GitHub Pages hosting

---

## 🎉 You're Ready!

Your platform is production-ready. Share the homepage URL with students and start growing!

**Your Admin Dashboard:** `https://yourusername.github.io/alpha-pack-capital-max/admin/login.html`

---

*Alpha Pack Capital Max v6.0 — Professional Student Lending Platform*
