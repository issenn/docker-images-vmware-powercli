'use strict';

module.exports = {
  editVersion: false,
  // editChangelog: true,

  // updateVersion: {
  //     preset: 'quoted',
  //     baseDir: '.',
  //     regexFlags: '',
  // },
  // updateVersion: 'update-version-file',
  // updateVersion: 'mixed',

  // defaultInitialVersion: '0.0.1',

  // getChangelogDocumentedVersions: {
  //   preset: 'changelog-headers',
  //   clean: /^v/
  // },

  // getGitReferenceFromVersion: 'v-prefix',

  // getCurrentBaseVersion: 'latest-documented',

  // parseFooterTags: true,
  // lowerCaseFooterTags: true,

  // getIncrementLevelFromCommit: 'change-type-or-subject',
  // getIncrementLevelFromCommit: (commit) => {
  //   return 'patch'
  // },
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

  // Always add the entry to the top of the Changelog, below the header.
  // addEntryToChangelog: {
  //   preset: 'prepend',
  //   fromLine: 2
  // },

  // includeCommitWhen: 'has-changetype',
  // includeCommitWhen: 'has-changelog-entry',

  // template: 'oneline',
  // template: 'default',

  // transformTemplateData: 'changelog-entry',

  // transformTemplateDataAsync: {
  //   preset: 'nested-changelogs',
  //   upstream: [
  //     {{#upstream}}
  //     {
  //       pattern: '{{{pattern}}}',
  //       repo: '{{repo}}',
  //       owner: '{{owner}}',
  //       ref: '{{ref}}'
  //     },
  //     {{/upstream}}
  //   ]
  // },
};
