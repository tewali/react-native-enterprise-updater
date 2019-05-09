/* eslint no-useless-escape: 0 */
/* eslint max-len: 0 */
/**
 * For more info regarding metro config:
 * @see https://facebook.github.io/metro/docs/en/configuration
 */
const path = require("path");
const fs = require("fs");

// Get blacklist factory
const blacklist = require("metro-config/src/defaults/blacklist");

let moduleBlacklist = [];

const baseModulePath = path.resolve(__dirname, "node_modules");

function getSymLinkedModules() {
  function checkModule(fileName, alternateRoots, modulePath) {
    try {
      const fullFileName = path.join(modulePath, fileName);
      const stats = fs.lstatSync(fullFileName);

      if (stats.isSymbolicLink()) {
        const realPath = fs.realpathSync(fullFileName);

        if (realPath.substring(0, (__dirname).length) !== __dirname) alternateRoots.push(realPath);
      }
    } catch (e) {
      // void
    }
  }

  function checkAllModules(modulePath, alternateRoots) {
    const stats = fs.lstatSync(modulePath);
    if (!stats.isDirectory()) return alternateRoots;

    fs.readdirSync(modulePath).forEach((fileName) => {
      if (fileName.charAt(0) === ".") return;

      if (fileName.charAt(0) !== "@") checkModule(fileName, alternateRoots, modulePath);
      else checkAllModules(path.join(modulePath, fileName), alternateRoots);
    });

    return alternateRoots;
  }

  return checkAllModules(baseModulePath, []);
}

function getExtraModulesForAlternateRoot(fullPath) {
  const packagePath = path.join(fullPath, "package.json");
  const packageJSON = require(packagePath);
  const alternateModules = [].concat(
      Object.keys(packageJSON.dependencies || {}),
      Object.keys(packageJSON.devDependencies || {}),
      Object.keys(packageJSON.peerDependencies || {})
  );
  const extraModules = {};

  for (let i = 0, il = alternateModules.length; i < il; i++) {
    const moduleName = alternateModules[i];
    extraModules[moduleName] = path.join(baseModulePath, moduleName);
  }

  return extraModules;
}

function getBlacklistedModulesForAlternateRoot(fullPath) {
  const packagePath = path.join(fullPath, "package.json");
  const packageJSON = require(packagePath);
  const alternateModules = [].concat(
      Object.keys(packageJSON.peerDependencies || {})
  );
  const extraModules = {};

  for (let i = 0, il = alternateModules.length; i < il; i++) {
    const moduleName = alternateModules[i];
    extraModules[moduleName] = path.join(fullPath, "node_modules", moduleName);
  }

  return extraModules;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// alternate roots (outside of project root)
const alternateRoots = getSymLinkedModules();

if (alternateRoots && alternateRoots.length) console.log("Found alternate project roots: ", alternateRoots);

// resolve external package dependencies by forcing them to look into path.join(__dirname, "node_modules")
const extraNodeModules = alternateRoots.reduce((obj, item) => {
  Object.assign(obj, getExtraModulesForAlternateRoot(item));

  return obj;
}, {});

const watchFolders = alternateRoots;

alternateRoots.forEach(root => {
  const modules = getBlacklistedModulesForAlternateRoot(root);

  moduleBlacklist = moduleBlacklist.concat(
      Object.keys(modules).map(key => RegExp(`${escapeRegExp(`${modules[key]}\\`)}.*`))
  );
});

// @see https://github.com/facebook/metro/blob/master/packages/metro-config/src/defaults/index.js
module.exports = {
  watchFolders,
  resolver: {
    extraNodeModules,
    blacklistRE: blacklist(moduleBlacklist)
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        // @see https://facebook.github.io/react-native/docs/0.56/performance#inline-requires
        inlineRequires: false,
      },
    }),
  },
};
