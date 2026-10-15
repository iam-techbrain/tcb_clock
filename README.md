# TCB Time - Live Flip Clock and Weather Command Station

A modern, immersive real-time dashboard featuring an authentic vintage flip clock, live weather intelligence, dynamic regional pulse, AI audio briefings, and Supabase database logging.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

---

## Features

- **Mechanical Flip Clock**: Mechanical flip card animations with real-time seconds, minutes, and hours display.
- **Live Weather Station**: Real-time atmospheric data powered by Open-Meteo (temperature, humidity, wind speed, UV index, and conditions).
- **AI Audio Briefing**: Generative audio weather synthesis and voice briefings for selected regions.
- **Interactive City Search**: Location lookup with automated geolocation fallback.
- **Regional Pulse and News Feed**: Localized feeds and updates for surrounding areas.
- **Supabase and Prisma Integration**: Automated logging of daily weather records and historical telemetry into Supabase PostgreSQL.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Modules (Glassmorphism and Flip Animations)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/tcb_time.git
cd tcb_time
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):

```env
DATABASE_URL="your-supabase-connection-pooler-url"
DIRECT_URL="your-supabase-direct-url"
```

### 4. Run database generation
```bash
npx prisma generate
```

### 5. Launch development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License
This project is open source and available under the [MIT License](LICENSE).
