'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const _semver = require('semver');
const semver = require('versionist/lib/semver');
const presets = require('versionist/lib/presets');


let commits;

const VALID_INCREMENT_LEVELS = [
  'prerelease',
  'prepatch',
  'preminor',
  'premajor',
  'patch',
  'minor',
  'major',
];

const isValidIncrementLevel = (level) => {
  return _.includes(VALID_INCREMENT_LEVELS, level.toLowerCase());
};

const isIncrementalCommit = (changeType) => {
  return Boolean(changeType) && changeType.trim().toLowerCase() !== 'none';
};

const getAuthor = (commitHash) => {
  if (commitHash) {
    return execSync(`git show --quiet --format="%an" ${commitHash}`, {
      encoding: 'utf8',
    }).replace('\n', '');
  }
  return 'Unknown author';
};

const getChangeType = (footer) => {
  return footer[
    Object.keys(footer).find((k) => k.toLowerCase() === '__change-type')
  ];
};

const getHigherIncrementLevel = (firstLevel, secondLevel) => {
  _.each([firstLevel, secondLevel], (level) => {
    if (level != null && !isValidIncrementLevel(level)) {
      throw new Error(`Invalid increment level: ${level}`);
    };
  });

  if (!firstLevel && !secondLevel) {
    return null;
  };

  const firstLevelIndex = _.indexOf(
    VALID_INCREMENT_LEVELS,
    firstLevel?.toLowerCase(),
  );
  const secondLevelIndex = _.indexOf(
    VALID_INCREMENT_LEVELS,
    secondLevel?.toLowerCase(),
  );

  return VALID_INCREMENT_LEVELS[Math.max(firstLevelIndex, secondLevelIndex)];
};

const calculateNextIncrementLevel = (commits, options) => {
  _.defaults(options, {
    getIncrementLevelFromCommit: getIncrementLevelFromCommit(),
  });

  if (_.isEmpty(commits)) {
    throw new Error('No commits to calculate the next increment level from');
  };

  const incrementCommit = _.reduce(
    commits,
    (currentCommit, commit) => {
      const commitLevel = options.getIncrementLevelFromCommit(commit);
      const level = getHigherIncrementLevel(commitLevel, currentCommit.level);
      if (level === currentCommit.level) {
        commit = currentCommit.commit;
      };
      return { level: level, commit: commit };
    },
    {},
  );

  return incrementCommit;
};

const getIncrementLevelFromCommit = (preset) => {
  _.defaults(preset, 'default');
  let func;
  switch (preset) {
    case 'change-type':
    case 'subject':
    case 'change-type-or-subject':
      func = (commit) => {
        const changeType = presets.getIncrementLevelFromCommit[preset]({}, commit);
        return changeType;
      };
      break;
    case 'major':
      func = (commit) => {
        return 'major';
      };
      break;
    case 'minor':
      func = (commit) => {
        return 'minor';
      };
      break;
    case 'patch':
      func = (commit) => {
        return 'patch';
      };
      break;
    case 'default':
      func = (commit) => {
        const changeType = getChangeType(commit.footer);
        if (isIncrementalCommit(changeType)) {
          return changeType.trim().toLowerCase();
        };
      };
      break;
    default:
      throw new Error(`invalid preset argument: ${preset}`);
  };
  return func;
  // if (_.includes([
  //   'change-type',
  //   'subject',
  //   'change-type-or-subject',
  // ], preset)) {
  //   return (commit) => {
  //     const changeType = presets.getIncrementLevelFromCommit[preset]({}, commit);
  //     return changeType;
  //   };
  // };
  // return (commit) => {
  //   const changeType = getChangeType(commit.footer);
  //   if (isIncrementalCommit(changeType)) {
  //     return changeType.trim().toLowerCase();
  //   };
  // };
};

const inc = (version, release, options, identifier, identifierBase) => {
  if (typeof (options) === 'string') {
    identifierBase = identifier;
    identifier = options;
    options = undefined;
  };

  switch (release) {
    case 'build': {
      const base = Number(identifierBase) ? 1 : 0;

      if (version.build.length === 0) {
        version.build = [base];
      } else {
        let i = version.build.length;
        while (--i >= 0) {
          if (typeof version.build[i] === 'number') {
            version.build[i]++;
            i = -2;
          };
          if (i === -1) {
            if (identifier === version.build.join('.') && identifierBase === false) {
              throw new Error('invalid increment argument: identifier already exists');
            };
            version.build.push(base);
          };
        };
      };
      if (identifier) {
        let build = [identifier, base];
        if (identifierBase === false) {
          build = [identifier];
        };
        if (_semver.compareIdentifiers(version.build[0], identifier) === 0) {
          if (isNaN(version.build[1])) {
            version.build = build;
          };
        } else {
          version.build = build;
        };
      };
      break;
    };
    default:
      throw new Error(`invalid increment argument: ${release}`);
  };
  version.raw = version.format();
  if (version.build.length) {
    version.raw += `+${version.build.join('.')}`;
  };
  return version;
};

const getPackageVersion = (options) => {
  _.defaults(options, {
    baseDir: '.',
    regex: 'docker-bake(\.override)?\.(json|hcl)',
    bakeTargets: 'default',
    version: '0.0.1',
  });
  let version;
  if (semver.checkValid(options.version)) {
    version = semver.parse(options.version);
  };
  const ALL_FILES = fs.readdirSync(options.baseDir);
  const regex = new RegExp(options.regex);
  const bakeTargets = options.bakeTargets.trim().replace(/[\s,]+/g,',').split(',');
  const bakeFiles = ALL_FILES.filter(f => f.match(regex)).map(f => path.join(options.baseDir.trim(), f));
  const fileArgs = bakeFiles.map(f => `-f ${f}`).join(' ');
  const bakeCmd = `docker buildx bake --print ${bakeTargets.join(' ')} ${fileArgs}`;
  const bakeOutput = execSync(bakeCmd).toString().trim();
  const bakeJson = JSON.parse(bakeOutput);
  const package_version = bakeJson.target?.default?.args?.PACKAGE_VERSION;
  const package_version_build_metadata = bakeJson.target?.default?.args?.PACKAGE_VERSION_BUILD_METADATA;
  if (
    package_version
    && semver.valid(package_version)
    // && semver.checkValid(package_version)
  ) {
    if (package_version_build_metadata
        && semver.valid(`${package_version}+${package_version_build_metadata}`)
        // && semver.checkValid(`${package_version}+${package_version_build_metadata}`)
    ) {
      version = semver.parse(`${package_version}+${package_version_build_metadata}`);
    } else {
      version = semver.parse(package_version);
    };
  };
  // return inc(version, 'build', `${version.build.join('.')}`, '0').raw;
  return version.version;
};

module.exports = {
  // editVersion: true,
  // editChangelog: true,

  // changelogFile: 'CHANGELOG.md',
  // historyFile: path.join('.versionbot', 'CHANGELOG.yml'),

  // updateVersion: {
  //     preset: 'quoted',
  //     baseDir: '.',
  //     regexFlags: '',
  // },
  updateVersion: 'update-version-file',
  // updateVersion: 'mixed',

  // defaultInitialVersion: '0.0.1',

  // getChangelogDocumentedVersions: {
  //   preset: 'changelog-headers',
  //   clean: /^v/
  // },
  getChangelogDocumentedVersions: (file, callback) => {
    return presets.getChangelogDocumentedVersions[
      'changelog-headers'
    ]({}, file, (error, versions) => {
      const version = getPackageVersion({});
      if (_.includes(versions, version)) {
        versions = versions.map((v) => { return v.trim(); }).sort(semver.rcompare);
        const index = _.indexOf(versions, version?.toLowerCase());
        versions.splice(0, index);
      };
      return callback(error, versions);
    });
  },

  // getGitReferenceFromVersion: 'v-prefix',

  // getCurrentBaseVersion: 'latest-documented',
  // getCurrentBaseVersion: (documentedVersions, history, callback) => {
  //   return presets.getCurrentBaseVersion[
  //     'latest-documented'
  //   ]({}, documentedVersions, history, callback);
  // },

  // parseFooterTags: true,
  // lowerCaseFooterTags: true,

  // getIncrementLevelFromCommit: 'change-type',
  // getIncrementLevelFromCommit: 'change-type-or-subject',
  getIncrementLevelFromCommit: getIncrementLevelFromCommit('patch'),

  // incrementVersion: 'semver',
  // incrementVersion: (version, incrementLevel) => {
  //   const v = version
  //     .replace(/^v/, '')
  //     .split('.');
  //   if (v.length !== 3) {
  //     throw new Error(`invalid version: ${version}`);
  //   }
  //   v[2] = Number(v[2]) + 1;
  //   return v.join('.');
  // },
  incrementVersion: (version, incrementLevel) => {
    return getPackageVersion({version: version});
  },

  // addEntryToHistoryFile: (file, raw, callback) => {
  //   return presets.incrementVersion['yml-prepend']({}, file, raw, callback);
  // },

  // Always add the entry to the top of the Changelog, below the header.
  // addEntryToChangelog: {
  //   preset: 'prepend',
  //   fromLine: 2
  // },
  // addEntryToChangelog: (file, entry, callback) => {
  //   return presets.incrementVersion.prepend({}, file, entry, callback);
  // },

  // updateContract: (cwd, version, callback) => {
  //   return presets.updateContract.version({}, cwd, version, callback);
  // },

  // includeCommitWhen: 'has-changetype',
  // includeCommitWhen: 'has-changelog-entry',

  // template: 'oneline',
  // template: 'default',

  // transformTemplateData: 'changelog-entry',
  transformTemplateData: (data) => {
    data.commits.forEach((commit) => {
      if (commit.footer) {
        commit.subject = commit.footer['changelog-entry'] || commit.subject;
      }
      commit.author = getAuthor(commit.hash);
    });

    return data;
  },

  // transformTemplateDataAsync: {
  //   preset: 'nested-changelogs',
  //   // upstream: [
  //   //   {{#upstream}}
  //   //   {
  //   //     pattern: '{{{pattern}}}',
  //   //     repo: '{{repo}}',
  //   //     owner: '{{owner}}',
  //   //     ref: '{{ref}}'
  //   //   },
  //   //   {{/upstream}}
  //   // ]
  // },
};
