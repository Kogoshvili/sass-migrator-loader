const fs = require('fs');
const path = require('path');
const exec = require("child_process").exec;

module.exports = function (source, map, meta) {
  const callback = this.async();
  const options = this.getOptions();
  const { migrations, flags } = options;

  const sourcePath = this.resourcePath;
  const sourceExt = path.extname(sourcePath);
  migrations
  const content = importContent(source, sourcePath);
  const tempFile = path.resolve(path.join(__dirname, '..', `./temp.${sourceExt}`));

  fs.writeFileSync(tempFile, content);

  migrate(tempFile, migrations, flags).then(() => {
    const buffer = fs.readFileSync(tempFile);
    const newContent = buffer.toString('utf8');
    fs.unlinkSync(tempFile);
    callback(null, newContent, map, meta);
  });
}

function importContent(source, sourcePath) {
  const regex = new RegExp(/@(import|use)( ?)[\"'](.+)[\"'];?/g);
  let match;
  let content = source;

  while (match = regex.exec(source)) {
    const importPath = match[3];
    const importFullPath = path.resolve(path.dirname(sourcePath), importPath);
    const importSource = fs.readFileSync(importFullPath, 'utf8');
    const nestedContent = importContent(importSource, importFullPath);
    content = content.replace(match[0], nestedContent);
  }

  return content;
}

async function migrate(filepath, migrations = defaultMigrations, flags = []) {
  const promises = migrations.map(migration => migrator(filepath, migration, flags));
  return Promise.all(promises);
}

async function migrator(filepath, migration, flags = []) {
  return new Promise((resolve, reject) => {
    const flagsString = flags.join(' ');
    exec(`sass-migrator ${migration} ${flagsString} ${filepath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  })
}

const defaultMigrations = [
  'division', // Use the math.div() function instead of the / division operator
  'media-logic', // Migrates deprecated `@media` query syntax.\nSee https://sass-lang.com/d/media-logic.
  'module', // Use the new module system.
  'namespace', // Change namespaces for `@use` rules.
  'strict-unary' // Migrates deprecated `$a -$b` syntax (and similar) to unambiguous `$a - $b`
];
