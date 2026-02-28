# Apna Medico - Healthcare Management System

A comprehensive healthcare platform with AI doctor consultations, ambulance booking, hospital locator, and medicine delivery.

## Features

- 🤖 AI Doctor Consultations with video calls
- 🚑 Real-time ambulance booking with GPS tracking
- 🏥 Hospital finder with bed availability
- 💊 Medicine delivery system
- 👥 Multi-role support (Patients, Doctors, Staff, Drivers)
- 📱 Responsive design with dark mode

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **Real-time**: Pusher, LiveKit
- **AI**: OpenAI GPT-4
- **File Upload**: UploadThing

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables from `env-example.txt`
4. Run database migrations: `npx prisma db push`
5. Start development: `npm run dev`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Render
1. Connect GitHub repository
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy

## Environment Variables

Copy `env-example.txt` to `.env.local` and fill in your API keys.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
