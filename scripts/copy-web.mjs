import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webDir = join(root, 'www');
const files = [
  'index.html',
  'styles.css',
  'i18n-base.js',
  'translations.js',
  'localization-runtime.js',
  'app.js',
  'theme.js',
  'backup.js',
  'native-shell.js',
  'reminders.js',
  'manifest.webmanifest',
  'robots.txt',
  'service-worker.js'
];

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
for (const file of files) {
  await cp(join(root, file), join(webDir, file));
}
await cp(join(root, 'assets'), join(webDir, 'assets'), { recursive: true });
await cp(join(root, 'neu'), join(webDir, 'neu'), { recursive: true });
