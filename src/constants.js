export const LOG_FILE = "access.log";
export const LOG_INTERVAL = 1 * 1000;

export const insertLogEntry = `
  INSERT INTO access_log (
    id,
    ip, 
    username, 
    first_name, 
    last_name, 
    email, 
    location, 
    job_area, 
    company, 
    job_title, 
    timestamp
    ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )`;
