import { app } from './app';
import { env } from './env';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`TemPro API em http://localhost:${env.PORT}`);
  });
}

export default app;
