export const corsOptions = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
  }

  return {
    origin: allowedOrigins,
  };
};
