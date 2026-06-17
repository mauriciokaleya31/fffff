// Entry point wrapper for Hostinger, Vercel, Heroku and other Node.js hosts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundlePath = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(bundlePath)) {
  console.warn("========================================================================");
  console.warn("AVISO: O bundle de produção em 'dist/server.cjs' não foi encontrado!");
  console.warn("Por favor, certifique-se de executar 'npm run build' antes de iniciar o");
  console.warn("servidor para gerar os ficheiros de produção (Vite + backend express).");
  console.warn("========================================================================");
}

// Dynamically import the compiled server bundle
import('./dist/server.cjs').catch((err) => {
  console.error("Houve um erro crítico ao carregar o servidor principal:", err);
  process.exit(1);
});
