import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Loaded as the first import in server.js. ES module imports run before the
// importing file's own code, so calling dotenv.config() in server.js's body
// would run after app.js had already read process.env.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
