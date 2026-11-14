import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);
// Strip query-selector injection ($gt, $ne, ...) from user-supplied filter objects.
mongoose.set('sanitizeFilter', true);

/**
 * Connects once and reuses the connection. On Vercel the same function instance
 * handles many requests, so the promise is cached on globalThis.
 */
const cache = globalThis.__raMongo || (globalThis.__raMongo = { promise: null });

export async function connectDB(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!cache.listening) {
    cache.listening = true;
    mongoose.connection.on('error', (err) => console.error('[db] connection error:', err.message));
  }
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: env.onVercel ? 5 : 10 })
      .then((m) => {
        console.log(`[db] connected to ${m.connection.host}/${m.connection.name}`);
        return m.connection;
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }
  return cache.promise;
}

export async function disconnectDB() {
  cache.promise = null;
  await mongoose.disconnect();
}
