import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('.firebase-credentials.json', 'utf-8').catch(() => '{}'));
// wait we don't have service account, we only have firebase-applet-config.json
