import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import { LOG_FILE, LOG_INTERVAL, insertLogEntry } from "./constants.js";
import { createDb } from "./db.js";

const db = createDb();
const fileStream = createReadStream(LOG_FILE);
const rl = createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

console.log(`Lendo ${LOG_FILE} e inserindo registros no banco de dados...`);

let count = 0;

for await (const line of rl) {
  if (!line.trim()) continue;

  let record;
  try {
    record = JSON.parse(line);
  } catch (error) {
    console.error(`Erro ao analisar a linha ${count + 1}: ${error.message}`);
    continue;
  }

  db.prepare(insertLogEntry).run(
    record.id,
    record.ip,
    record.username,
    record.first_name,
    record.last_name,
    record.email,
    record.location,
    record.job_area,
    record.company,
    record.job_title,
    record.timestamp,
  );
  count++;

  if (count % LOG_INTERVAL === 0) {
    console.log(`${count} registros inseridos...`);
  }
}

console.log(`Processo concluído. Total de registros inseridos: ${count}`);
db.close();
