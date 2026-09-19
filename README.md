
FixMyCampus 🏛️
AI-Powered Campus Infrastructure Intelligence — See It. Report It. Track It. Get It Fixed.
FixMyCampus is a mobile-first, smart issue-reporting web application built exclusively for the Gayatri Vidya Parishad College of Engineering (GVPCE) Madhurawada campus. It empowers students and staff to instantly report infrastructure, cleanliness, and safety issues while utilizing AI to auto-categorize and prioritize reports for college administrators.
✨ Key Features
 * Restricted Domain Authentication: Secure OTP-based login strictly locked to @gvpce.ac.in addresses, with automated Roll Number extraction for accountability.
 * AI-Powered Image Analysis: Integrates Google Gemini (3.8 Flash) to analyze uploaded photos, automatically suggesting the issue category, severity, and generating a detailed description.
 * Verified Campus Directory: Hardcoded, verified location mapping for Blocks B0 through B11 (Rooms 101–405), plus key campus facilities (Hostels, Main Ground, Canteens, Library).
 * Smart Duplicate Prevention: Scans historical reports within a 90-day window and 80-meter radius to prevent spam, prompting users to "upvote" existing issues instead of creating duplicates.
 * Rich Admin Email Alerts: Automated SMTP routing delivers comprehensive issue alerts directly to the admin's inbox, featuring deterministic impact scoring and embedded evidence photos (CID attachments).
 * Serverless-Ready: Optimized Next.js API routes with robust asynchronous handling to prevent dropped SMTP connections on cloud environments like Vercel.
🛠️ Tech Stack
 * Frontend: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
 * Backend: Next.js Serverless API Routes
 * Database: MongoDB Atlas (Mongoose/Native Driver)
 * AI Integration: @google/genai (Gemini API)
 * Authentication: Custom JWT Session + Nodemailer OTP
 * Email Service: Nodemailer
🚀 Local Setup & Installation
1. Clone the repository
git clone https://github.com/KRISHNA111311/fixmycampus.git
cd fixmycampus

2. Install dependencies
npm install

3. Configure Environment Variables
Create a .env.local file in the root directory and add the following keys:
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fixmycampus"

# Authentication & Security
AUTH_SECRET="generate_a_random_secure_string_here"
ALLOWED_EMAIL_DOMAIN="gvpce.ac.in"
OTP_TTL_SECONDS=600

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-1.5-flash" # or gemini-3.8-flash

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE="true"
SMTP_USER="your_sender_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM='"FixMyCampus" <your_sender_email@gmail.com>'
ADMIN_EMAIL="admin_receiver@gmail.com"

4. Seed the GVPCE Database
Populate the MongoDB collections with the verified GVPCE Madhurawada campus locations (B0-B11, Hostels, Grounds, etc.):
npx tsx scripts/seed-gvpce.ts

5. Run the Development Server
npm run dev

Open http://localhost:3000 in your browser.
☁️ Deployment (Vercel)
This application is fully optimized for Vercel's serverless environment.
 * Ensure your MongoDB Atlas Network Access is set to allow connections from anywhere (0.0.0.0/0), as Vercel uses dynamic IPs.
 * Import the repository into your Vercel dashboard.
 * Paste all values from .env.local into the Vercel Environment Variables settings.
 * Click Deploy.
   (Note: Do not run the seed script on Vercel; as long as your Vercel app points to the same MongoDB Atlas URI you seeded locally, the data will be there).
👨‍💻 Author
Kengam Mohan Krishna
B.Tech Computer Science and Engineering (Data Science)
Gayatri Vidya Parishad College of Engineering (Autonomous)
Developed as a student initiative to keep GVPCE clean, safe, and functioning.
