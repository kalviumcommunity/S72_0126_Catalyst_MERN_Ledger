import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Import and use API routes (lazy loading to avoid schema errors at startup)
app.use('/api/users', async (req, res, next) => {
  const usersRouter = (await import('./app/api/users/express-route')).default;
  return usersRouter(req, res, next);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`\n🔥 Ready to test Redis caching!`);
  console.log(`\n💡 Test commands:`);
  console.log(`   Cold start: curl http://localhost:${PORT}/api/users`);
  console.log(`   Cache hit:  curl http://localhost:${PORT}/api/users (run again immediately)`);
});
