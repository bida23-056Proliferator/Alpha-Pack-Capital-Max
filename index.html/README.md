# 🚀 Alpha Pack Capital Max v6.0

**Professional Student Lending Platform for Botswana**

---

## ✨ What's Included

A complete, production-ready platform with:

### 📱 Student Interface
- **Premium Modern UI** with professional design
- **Mobile-first responsive** (works on all devices)
- **Registration & Login** with email verification
- **Student ID Verification** with photo upload + camera support
- **Loan Calculator** with real-time interest calculation
- **Loan Application** with status tracking
- **Student Dashboard** with full loan history
- **WhatsApp Integration** for easy contact

### 👨‍💼 Admin Dashboard
- **Insane Dashboard** with real-time KPIs
- **KYC Queue** with photo viewer
- **Loan Queue** with approve/decline
- **Business Analytics** with charts
- **Ad Management System**
- **Settings Configuration**
- **Student Management**
- **Audit Logging**

### 🛡️ Security & Backend
- **Supabase PostgreSQL** database
- **Row-Level Security (RLS)** on all tables
- **Email Authentication** with Supabase Auth
- **Private KYC Storage** with access control
- **HTTPS Encrypted** (GitHub Pages)
- **Admin Role-Based Access**

---

## 🚀 Quick Start (10 minutes)

### 1. Setup Supabase (5 min)

1. Open **SETUP_GUIDE.md** — follow Section "Step 1: Supabase Setup"
2. Copy the SQL code and run in Supabase
3. Create storage bucket `kyc-docs`
4. Configure Auth settings

### 2. Create Admin Account (2 min)

After deploying (Step 3), visit: `yoursite.com/admin/setup.html`
- Enter email & password
- Click **Create Admin**
- Delete setup.html from GitHub (security!)

### 3. Deploy to GitHub Pages (3 min)

```bash
git init
git add .
git commit -m "Alpha Pack Capital Max"
git remote add origin https://github.com/yourusername/alpha-pack-capital-max.git
git branch -M main
git push -u origin main
```

Then enable Pages in GitHub Settings.

---

## 📚 Files Structure

```
alpha-pack-capital-max/
├── index.html                    ← Homepage
├── admin/
│   ├── setup.html               ← Create admin (delete after use!)
│   ├── login.html               ← Admin login
│   ├── dashboard.html           ← Main admin dashboard
│   ├── kyc-queue.html           ← Student ID reviews
│   ├── loan-queue.html          ← Loan approvals
│   ├── analytics.html           ← Charts & insights
│   ├── ads.html                 ← Ad management
│   ├── settings.html            ← Configuration
│   └── students.html            ← User management
│
├── assets/
│   ├── css/
│   │   └── main.css             ← Modern design system
│   │
│   └── js/
│       ├── app.js               ← Router & logic
│       └── modules/
│           ├── config.js        ← Business config
│           ├── db.js            ← Database layer
│           └── ui.js            ← UI utilities
│
├── docs/
│   ├── SETUP_GUIDE.md           ← Complete setup instructions
│   ├── SUPABASE_SCHEMA.sql      ← Database schema
│   └── API_REFERENCE.md         ← Code documentation
│
└── README.md                     ← This file
```

---

## 🎯 Features

### Student
- ✅ Registration with institution validation
- ✅ Email verification
- ✅ Student ID upload (drag & drop + camera)
- ✅ Real-time loan calculator
- ✅ Loan application with breakdown
- ✅ Application status tracking
- ✅ WhatsApp contact buttons
- ✅ Responsive mobile design

### Admin
- ✅ Live KPI dashboard
- ✅ KYC photo viewer
- ✅ Loan detail modal
- ✅ Approve/decline decisions
- ✅ Analytics charts (Chart.js)
- ✅ Ad creation & management
- ✅ Settings editor
- ✅ Student browser
- ✅ Audit log
- ✅ Export capabilities

### Technical
- ✅ Modern CSS (1000+ lines)
- ✅ Complete JavaScript modules
- ✅ Supabase integration
- ✅ RLS security
- ✅ Real-time data
- ✅ Mobile responsive
- ✅ Production ready

---

## 💼 Business Configuration

All in `assets/js/modules/config.js`:

```javascript
export const BIZ = {
  name: "Alpha Pack Capital Max",
  interestRateMin: 0.25,    // 25% for loans > P1,000
  interestRateMax: 0.30,    // 30% for loans ≤ P1,000
  packages: [
    { id: "starter", min: 100, max: 500 },
    { id: "boost", min: 500, max: 1000 },
    { id: "advance", min: 1000, max: 2000 },
    { id: "premium", min: 2000, max: 5000 },
  ],
  phone1: "+267 76 807 549",
  phone2: "+267 78 322 911",
  // ... more settings
};
```

Change this to customize your business rules!

---

## 🔐 Security Features

- ✅ **HTTPS** via GitHub Pages
- ✅ **Password Hashing** by Supabase
- ✅ **Row-Level Security** on database
- ✅ **Admin-Only Pages** protected
- ✅ **Private Storage** for KYC docs
- ✅ **Email Verification** required
- ✅ **Session Management** auto-refresh
- ✅ **CSRF Protection** via tokens

---

## 📱 Responsive Design

- ✅ **Desktop:** Full layout with sidebar
- ✅ **Tablet:** Adjusted grid & spacing
- ✅ **Mobile:** Single column, touch-optimized
- ✅ **Large screens:** Max-width containers
- ✅ **All browsers:** Chrome, Firefox, Safari, Edge

---

## 🐛 Troubleshooting

See **SETUP_GUIDE.md** → Troubleshooting section for:
- Blank page errors
- Supabase connection issues
- Admin login problems
- Camera not working
- KYC upload failures
- And more...

---

## 📞 Support

1. Read **SETUP_GUIDE.md** (comprehensive)
2. Check browser console (F12)
3. Verify Supabase Dashboard
4. Check GitHub Pages status

---

## 🎓 Learning Resources

- **Supabase Docs:** https://supabase.com/docs
- **GitHub Pages:** https://pages.github.com
- **Modern CSS:** See `assets/css/main.css` (well-commented)
- **JavaScript:** See `assets/js/modules/` (modular)

---

## 📊 Database Schema

Tables:
- **profiles** — Users + KYC status
- **loans** — Applications + decisions
- **settings** — Business configuration
- **ads** — Homepage advertisements
- **audit_log** — Admin actions

All with Row-Level Security policies.

---

## 💡 Pro Tips

1. **First Admin:** Use `admin/setup.html` (then delete!)
2. **Test Flow:** Register → Verify ID → Apply → Approve
3. **Mobile:** Test on iPhone & Android
4. **Supabase:** Monitor database in Dashboard
5. **Analytics:** Charts use Chart.js library

---

## 🚀 Deployment Checklist

- [ ] Read SETUP_GUIDE.md
- [ ] Import SQL schema to Supabase
- [ ] Create storage bucket `kyc-docs`
- [ ] Configure Supabase Auth settings
- [ ] Create GitHub repository
- [ ] Push files to main branch
- [ ] Enable GitHub Pages
- [ ] Create admin account (setup.html)
- [ ] Delete setup.html from GitHub
- [ ] Test with student account
- [ ] Share with students!

---

## 🎉 You're Ready!

Your platform is production-ready.

**Next Steps:**
1. Follow SETUP_GUIDE.md
2. Deploy to GitHub Pages
3. Create admin account
4. Share with students
5. Start earning from loans!

---

*Alpha Pack Capital Max v6.0 — The most professional student lending platform for Botswana.*

**Made with ❤️ for students | Built for reliability | Designed for success**
