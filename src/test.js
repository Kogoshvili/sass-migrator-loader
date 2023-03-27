/* eslint-disable no-control-regex */
/* eslint-disable func-names */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-sync */
/* eslint-disable no-cond-assign */
/* eslint-disable max-len */
/* eslint-disable no-useless-escape */

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const loaderUtils = require('loader-utils');
// let num = 0;
module.exports = function (source, map, meta) {
    let _this$getOptions;
    const rootDir = this.rootContext;
    const callback = this.async();
    const options = (this === null || this === void 0 ? void 0 : (_this$getOptions = this.getOptions) === null || _this$getOptions === void 0 ? void 0 : _this$getOptions.call(this)) || loaderUtils.getOptions(this);
    const {
        migrations,
        flags,
        nodeModulesPrefix = '~',
        srcPrefix = 'app'
    } = options;
    const sourcePath = this.resourcePath;
    const sourceExt = path.extname(sourcePath);
    const content = importContent(source, sourcePath, rootDir, nodeModulesPrefix, srcPrefix);
    const cleanContent = content.replace(/[\u200B-\u200D\uFEFF]/g, '');
    const tempFile = path.resolve(path.join(__dirname, '..', `./temp.${sourceExt.startsWith('.') ? sourceExt.slice(1) : sourceExt}`));
    // const tempFile2 = path.resolve(path.join(__dirname, '..', `./temp${num}.${sourceExt.startsWith('.') ? sourceExt.slice(1) : sourceExt}`));

    fs.writeFileSync(tempFile, cleanContent);
    // fs.writeFileSync(tempFile2, cleanContent);

    migrate(tempFile, migrations, flags).then(() => {
        const buffer = fs.readFileSync(tempFile);
        const newContent = buffer.toString('utf8');
        // fs.unlinkSync(tempFile);
        callback(null, newContent, map, meta);
    });
};
function importContent(source, sourcePath, rootDir, nodeModulesPrefix, srcPrefix) {
    const regex = new RegExp(/@(import|use)( ?)[\"'](.+)[\"'];/g);
    let match;
    let content = source;
    while (match = regex.exec(source)) {
        let importPath = match[3];

        if (importPath.startsWith(srcPrefix)) {
            importPath = importPath.replace(srcPrefix, `${rootDir}/src/`);
        } else if (importPath.startsWith(`${nodeModulesPrefix}${srcPrefix}`)) {
            importPath = importPath.replace(`${nodeModulesPrefix}${srcPrefix}`, `${rootDir}/src/`);
        } else if (importPath.startsWith('src')) {
            importPath = importPath.replace('src', `${rootDir}/src/`);
        } else if (importPath.startsWith(nodeModulesPrefix)) {
            importPath = importPath.replace(nodeModulesPrefix, `${rootDir}/node_modules/`);
        } else if (importPath.startsWith('@')) {
            importPath = `${rootDir}/node_modules/${importPath}`;
        }

        const importFullPath = path.resolve(path.dirname(sourcePath), importPath);
        let filePath = '';

        if (importPath === './print-styles.scss') {
            console.log(importFullPath);
        }

        if (!fs.existsSync(importFullPath)) {
            const fileDir = path.dirname(importFullPath);
            const fileExt = path.extname(importFullPath);
            const fileName = path.basename(importFullPath, fileExt);

            const fileExtensions = fileExt ? [fileExt] : ['.scss', '.sass', '.css'];
            const fileNames = [fileName, `_${fileName}`];

            for (const ext of fileExtensions) {
                for (const name of fileNames) {
                    const candidatePath = path.join(fileDir, `${name}${ext}`);
                    if (fs.existsSync(candidatePath)) {
                        filePath = candidatePath;
                        break;
                    }
                }
                if (filePath) {
                    break;
                }
            }
        } else {
            filePath = importFullPath;
        }
        let importSource = '';

        try {
            importSource = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            console.error(e);
            console.log(filePath, importFullPath);
        }

        const nestedContent = importContent(importSource, filePath, rootDir, nodeModulesPrefix, srcPrefix);
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
    });
}
const defaultMigrations = ['division'];
// ['division', 'media-logic', 'module', 'namespace', 'strict-unary'];
