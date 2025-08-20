# Sezora - Agricultural Job Marketplace MVP

A modern web application connecting agricultural students with farming opportunities, built for weekend launch.

## 🌾 Features

### For Students
- **Profile Management**: Create and update your agricultural student profile
- **Job Discovery**: Browse approved agricultural job opportunities
- **Easy Applications**: Apply to jobs with one click
- **Real-time Messaging**: Chat directly with employers
- **Application Tracking**: Monitor your application status

### For Employers
- **Job Posting**: Post agricultural job opportunities
- **Application Management**: Review and manage student applications
- **Direct Communication**: Message students directly
- **Dashboard Analytics**: Track your job postings and applications

### For Administrators
- **Job Approval**: Review and approve job postings
- **Content Moderation**: Ensure quality and appropriate content

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

## 🛠️ Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd sezora-mvp
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Go to Settings > Database and run the SQL from `database-schema.sql`

3. **Environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create accounts for both students and employers to test functionality

## 🗄️ Database Setup

Run the SQL commands in `database-schema.sql` in your Supabase SQL editor. This will create:

- User profiles with student/employer types
- Jobs table with approval workflow
- Applications table linking students to jobs
- Messages table for real-time chat
- Row Level Security (RLS) policies for data protection

## 👤 Admin Access

To access the admin panel:
1. Create a user account with email `admin@sezora.com`
2. Navigate to `/admin` to review and approve job postings

## 🚀 Deployment to Vercel

1. **Connect to Vercel:**
   - Import your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```

3. **Deploy:**
   - Vercel will automatically deploy on git pushes
   - Custom domain can be configured in Vercel settings

## 📱 Mobile Responsive

The application is fully optimized for mobile devices with:
- Responsive navigation
- Touch-friendly interfaces
- Mobile-optimized layouts
- Progressive Web App capabilities

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- Authentication required for all user actions
- Protected routes with middleware
- Input validation and sanitization

## 📊 Key User Flows

### Student Flow
1. Sign up as student
2. Complete profile
3. Browse approved jobs
4. Apply to jobs
5. Chat with employers (if accepted)

### Employer Flow
1. Sign up as employer
2. Complete company profile
3. Post job (pending approval)
4. Review applications
5. Accept/reject candidates
6. Chat with accepted students

### Admin Flow
1. Access admin panel
2. Review pending jobs
3. Approve/reject postings
4. Monitor platform activity

## 🐛 Known Limitations

- Admin access is email-based (production would use proper RBAC)
- No file upload for resumes (can be added later)
- Basic messaging (no file sharing)
- No payment integration
- No advanced search filters

## 🔄 Future Enhancements

- Resume/portfolio uploads
- Advanced search and filtering
- Email notifications
- Payment processing
- Mobile app versions
- Video call integration
- Reference system
- Rating and review system

## 📞 Support

For technical issues or feature requests, please open an issue in the repository.

---

Built with ❤️ for the agricultural community
