import { PrismaClient } from "@prisma/client";
import faker from "faker";

const db = new PrismaClient();

async function main() {
  await db.$transaction(
    Array.from({ length: 200 }).map(() =>
      db.post.create({ data: { title: faker.commerce.productName() } })
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
