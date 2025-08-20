# Deployment Checklist for Sezora MVP

## Pre-Deployment Setup

### 1. Supabase Configuration
- [ ] Create Supabase project
- [ ] Run `database-schema.sql` in SQL Editor
- [ ] Enable Row Level Security on all tables
- [ ] Configure authentication settings
- [ ] Test database connections
- [ ] Set up realtime subscriptions

### 2. Environment Variables
- [ ] Copy `.env.local.example` to `.env.local` for development
- [ ] Configure production environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Code Quality
- [ ] Run `npm run build` to check for build errors
- [ ] Test all user flows (student, employer, admin)
- [ ] Verify mobile responsiveness
- [ ] Check authentication flows
- [ ] Test real-time messaging

## Vercel Deployment

### 1. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure all sensitive data is in environment variables
- [ ] Verify `.gitignore` excludes `.env.local` and other sensitive files

### 2. Vercel Configuration
- [ ] Import GitHub repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure deployment settings

### 3. Production Testing
- [ ] Test user registration for both student and employer
- [ ] Verify job posting and approval workflow
- [ ] Test application system
- [ ] Verify real-time messaging works
- [ ] Test admin functionality with `admin@sezora.com`

## Post-Deployment

### 1. Initial Data
- [ ] Create admin account (`admin@sezora.com`)
- [ ] Create test student and employer accounts
- [ ] Post test jobs and approve them
- [ ] Test end-to-end user journey

### 2. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Supabase usage and limits
- [ ] Check Vercel function logs
- [ ] Monitor performance metrics

### 3. Security
- [ ] Review RLS policies in Supabase
- [ ] Verify authentication is working properly
- [ ] Check for any exposed sensitive data
- [ ] Test access controls

## Go-Live Checklist

### Technical
- [ ] All features working in production
- [ ] Performance is acceptable
- [ ] Mobile experience is optimized
- [ ] No console errors
- [ ] All links and navigation work

### Content
- [ ] Landing page content is accurate
- [ ] Help/support information is available
- [ ] Terms of service and privacy policy (if needed)
- [ ] Contact information is correct

### Marketing
- [ ] Analytics tracking setup (Google Analytics, etc.)
- [ ] Social media links configured
- [ ] SEO meta tags optimized
- [ ] Domain and SSL certificate active

## Rollback Plan

If issues arise:
1. Revert to previous Vercel deployment
2. Check Supabase logs for database issues
3. Verify environment variables are correct
4. Check GitHub for recent changes that might cause issues

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

## Emergency Contacts

- Developer: [Your contact information]
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support