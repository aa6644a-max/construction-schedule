$env:DATABASE_URL="file:./prisma/dev.db"
$env:NEXTAUTH_SECRET="dev-secret-key-change-in-production"
$env:NEXTAUTH_URL="http://localhost:3000"
npm run dev
