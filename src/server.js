import { createApp } from './app.js';
import { readConfig } from './config.js';
const { port, host } = readConfig();
const server = createApp().listen(port, host, () => console.log(`API listening on http://${host}:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
