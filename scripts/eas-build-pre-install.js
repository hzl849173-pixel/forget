const fs = require('fs');
const path = require('path');

const envValue = process.env.GOOGLE_SERVICES_JSON;

if (!envValue) {
  console.log('[eas-build-pre-install] GOOGLE_SERVICES_JSON is not set, skipping.');
  process.exit(0);
}

const targets = [
  path.join(__dirname, '..', 'android', 'app', 'google-services.json'),
  path.join(__dirname, '..', 'google-services.json'),
];

let content = null;

// Case 1: envValue is a file path (EAS file environment variable)
if (fs.existsSync(envValue)) {
  console.log(`[eas-build-pre-install] Reading from file path: ${envValue}`);
  content = fs.readFileSync(envValue);
} else {
  // Case 2: envValue is the raw JSON string or base64-encoded string
  console.log('[eas-build-pre-install] Reading from raw environment string');
  const trimmed = envValue.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    content = Buffer.from(trimmed, 'utf8');
  } else {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        content = Buffer.from(decoded, 'utf8');
      } else {
        content = Buffer.from(trimmed, 'utf8');
      }
    } catch {
      content = Buffer.from(trimmed, 'utf8');
    }
  }
}

for (const target of targets) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, content);
  console.log(`[eas-build-pre-install] Successfully wrote ${target}`);
}
