'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');

function loadConfig(directory = __dirname, environment = process.env) {
 let file = {};
 try { file = parseEnv(fs.readFileSync(path.join(directory, '.env'), 'utf8')); }
 catch (error) { if (error.code !== 'ENOENT') throw error; }
 const value = (name, fallback = '') => environment[name] ?? file[name] ?? fallback;
 const drives = value('VIKING_DRIVES', 'O,P,Q,R,S,T,U,V').split(',').map(drive => drive.trim().toUpperCase().replace(/:$/, ''));
 if (drives.length !== 8 || drives.some(drive => !/^[A-Z]$/.test(drive)) || new Set(drives).size !== 8) throw new Error('VIKING_DRIVES må inneholde åtte ulike diskbokstaver.');
 const hostPrefix = value('VIKING_HOST_PREFIX', 'slave');
 const share = value('VIKING_SHARE', 'c$');
 const imageDir = value('VIKING_IMAGE_DIR', 'Viking2001\\GameCtrl');
 if (!/^[a-zA-Z0-9_-]+$/.test(hostPrefix)) throw new Error('Ugyldig VIKING_HOST_PREFIX.');
 if (!share || /[\\/\r\n]/.test(share)) throw new Error('Ugyldig VIKING_SHARE.');
 if (!imageDir || path.win32.isAbsolute(imageDir) || /[:\r\n]/.test(imageDir) || imageDir.split(/[\\/]/).includes('..')) throw new Error('VIKING_IMAGE_DIR må være en relativ mappe uten ..');
 return { drives, hostPrefix, share, imageDir, username: value('VIKING_USERNAME'), password: value('VIKING_PASSWORD') };
}
module.exports = { loadConfig };
if (require.main === module) {
 try {
  const config = loadConfig();
  if (!config.username || !config.password) throw new Error('Mangler VIKING_USERNAME eller VIKING_PASSWORD. Kopier .env.example til .env og fyll inn påloggingen.');
  process.stdout.write(JSON.stringify(config));
 } catch (error) { console.error(error.message); process.exitCode = 1; }
}
