import express from 'express';

import { app } from './app';
import { env } from './env';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`TemPro API em http://localhost:${env.PORT}`);
  });
}

const application: express.Express = app;
export default application;
