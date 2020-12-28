import settings from 'electron-settings';
import fse from 'fs-extra';
import path from 'path';
import os from 'os';

export const docDir = path.join(os.homedir(), '标签纸打印');
const settingsPath = path.join(docDir, 'settings.json');
fse.ensureFileSync(settingsPath);

settings.setPath(settingsPath);

export default settings;
