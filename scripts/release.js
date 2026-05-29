const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;
const releaseArg = process.argv[2];
const notes = process.argv.slice(3).map((item) => item.trim()).filter(Boolean);

if (!releaseArg) {
  console.error('Usage: npm run release -- <patch|minor|major|x.y.z> "change 1" "change 2"');
  process.exit(1);
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
const readText = (filePath) => fs.readFileSync(filePath, 'utf8');
const writeText = (filePath, value) => fs.writeFileSync(filePath, value);

const parseVersion = (value) => {
  const match = value.match(semverPattern);
  if (!match) {
    throw new Error(`Invalid version: ${value}`);
  }

  return match.slice(1).map(Number);
};

const formatVersion = ([major, minor, patch]) => `${major}.${minor}.${patch}`;

const getNextVersion = (currentVersion, target) => {
  if (semverPattern.test(target)) {
    return target;
  }

  const [major, minor, patch] = parseVersion(currentVersion);

  if (target === 'patch') {
    return formatVersion([major, minor, patch + 1]);
  }

  if (target === 'minor') {
    return formatVersion([major, minor + 1, 0]);
  }

  if (target === 'major') {
    return formatVersion([major + 1, 0, 0]);
  }

  throw new Error(`Unsupported release target: ${target}`);
};

const buildChangelogEntry = (version, items) => {
  const lines = items.length > 0 ? items : [`Chore: Bump version to ${version}`];
  return `## ${version}\n\n${lines.map((line) => `- ${line}`).join('\n')}\n`;
};

const prependChangelogEntry = (existingContent, entry) => {
  const normalized = existingContent.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return `# Change Log\n\n${entry}\n`;
  }

  if (!normalized.startsWith('# Change Log')) {
    return `# Change Log\n\n${entry}\n${normalized}\n`;
  }

  const body = normalized.slice('# Change Log'.length).trimStart();
  return body ? `# Change Log\n\n${entry}\n${body}\n` : `# Change Log\n\n${entry}\n`;
};

try {
  const packageJson = readJson(packageJsonPath);
  const currentVersion = packageJson.version;
  const nextVersion = getNextVersion(currentVersion, releaseArg);

  if (currentVersion === nextVersion) {
    throw new Error(`Version is already ${nextVersion}`);
  }

  const changelogContent = readText(changelogPath);
  if (changelogContent.includes(`## ${nextVersion}`)) {
    throw new Error(`CHANGELOG.md already contains version ${nextVersion}`);
  }

  packageJson.version = nextVersion;
  writeJson(packageJsonPath, packageJson);

  if (fs.existsSync(packageLockPath)) {
    const packageLock = readJson(packageLockPath);
    packageLock.version = nextVersion;
    if (packageLock.packages && packageLock.packages['']) {
      packageLock.packages[''].version = nextVersion;
    }
    writeJson(packageLockPath, packageLock);
  }

  const entry = buildChangelogEntry(nextVersion, notes);
  const updatedChangelog = prependChangelogEntry(changelogContent, entry);
  writeText(changelogPath, updatedChangelog);

  console.log(`Released ${currentVersion} -> ${nextVersion}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
