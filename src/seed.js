import { faker } from "@faker-js/faker";
import { createWriteStream, statSync } from "node:fs";

const LOG_FILE = "access.log";
const LOG_INTERVAL = 1 * 1000;
const maxRecords = Number(process.argv[2] || Infinity);

if (
  !Number.isInteger(maxRecords) ||
  Number.isNaN(maxRecords) ||
  maxRecords <= 0
) {
  console.error("Uso: npm run seed -- <quantidade>");
  console.error("A quantidade deve ser um número inteiro positivo.");
  process.exit(1);
}

function generateUser() {
  return {
    ip: faker.internet.ip(),
    username: faker.internet.userName(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    location: faker.location.city(),
    job_area: faker.person.jobArea(),
    company: faker.company.name(),
    job_title: faker.person.jobTitle(),
    id: faker.string.uuid(),
  };
}

function generateLogEntry(user) {
  return {
    ...user,
    timestamp: faker.date.recent().toISOString(),
  };
}

const stream = createWriteStream(LOG_FILE, { flags: "a" });

function writeRecord(line) {
  return new Promise((resolve, reject) => {
    if (!stream.write(line)) {
      stream.once("drain", resolve);
    } else {
      resolve();
    }
  });
}

console.log(`Gerando ${maxRecords} registros no arquivo ${LOG_FILE}...`);

const users = Array.from({ length: 5 }, generateUser);

let count = 0;

const convertFromBytesToGB = (bytes) => bytes / (1024 / 1024 / 1024).toFixed(4);

process.on("SIGINT", () => {
  stream.end(() => {
    const { size } = statSync(LOG_FILE);
    console.log(
      `Geração interrompida. Registros gerados: ${count}, tamanho do arquivo: ${convertFromBytesToGB(size)} GB`,
    );
  });
});

while (count < maxRecords) {
  const user = faker.helpers.arrayElement(users);
  const record = generateLogEntry(user);

  await writeRecord(JSON.stringify(record) + "\n");
  count++;

  if (count % LOG_INTERVAL === 0) {
    const { size } = statSync(LOG_FILE);
    console.log(
      `Registros gerados: ${count}, tamanho do arquivo: ${convertFromBytesToGB(size)} GB`,
    );
  }
}

stream.end(() => {
  const { size } = statSync(LOG_FILE);
  console.log(
    `Geração concluída. Registros gerados: ${count}, tamanho do arquivo: ${convertFromBytesToGB(size)} GB`,
  );
});
