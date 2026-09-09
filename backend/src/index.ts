import { app } from './app';
import { prisma } from './db';
import { env } from './env';

async function main() {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    console.log(`TemPro API em http://localhost:${env.PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
