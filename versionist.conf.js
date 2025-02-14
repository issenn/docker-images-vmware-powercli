'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

module.exports = {
  editVersion: true,
  // editChangelog: true,

  // updateVersion: {
  //     preset: 'quoted',
  //     baseDir: '.',
  //     regexFlags: '',
  // },
  updateVersion: 'update-version-file',
  // updateVersion: 'mixed',

  // defaultInitialVersion: '0.0.1',

  getChangelogDocumentedVersions: {
    preset: 'changelog-headers',
    clean: /^v/
  },

  getGitReferenceFromVersion: 'v-prefix',

  getCurrentBaseVersion: 'latest-documented',

  parseFooterTags: true,
  lowerCaseFooterTags: true,

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
  incrementVersion: (version, incrementLevel) => {
    const WORKDIR = "."
    const BAKE_TARGETS = "default"
    const ALL_FILES = fs.readdirSync(WORKDIR)
    const bakeTargets = BAKE_TARGETS.trim().replace(/[\s,]+/g,',').split(',');
    const bakeFiles = ALL_FILES
      .filter(f => f.match(/docker-bake(\.override)?\.(json|hcl)/))
      .map(f => path.join(WORKDIR.trim(), f));
    const fileArgs = bakeFiles.map(f => `-f ${f}`).join(' ');
    const bakeCmd = `docker buildx bake --print ${bakeTargets.join(' ')} ${fileArgs}`;
    const bakeOutput = execSync(bakeCmd).toString().trim();
    const bakeJson = JSON.parse(bakeOutput);
    const package_version = bakeJson.target?.default?.args?.PACKAGE_VERSION || version;
    // const package_version_build_metadata = bakeJson.target?.default?.args?.PACKAGE_VERSION_BUILD_METADATA || '';
    // version = !package_version_build_metadata ? package_version
    //   : `${package_version}-${package_version_build_metadata}`;
    return package_version;
  },

  // Always add the entry to the top of the Changelog, below the header.
  // addEntryToChangelog: {
  //   preset: 'prepend',
  //   fromLine: 2
  // },

  includeCommitWhen: 'has-changetype',
  // includeCommitWhen: 'has-changelog-entry',

  // template: 'oneline',
  template: 'default',

  // transformTemplateData: 'changelog-entry',

  transformTemplateDataAsync: {
    preset: 'nested-changelogs',
    // upstream: [
    //   {{#upstream}}
    //   {
    //     pattern: '{{{pattern}}}',
    //     repo: '{{repo}}',
    //     owner: '{{owner}}',
    //     ref: '{{ref}}'
    //   },
    //   {{/upstream}}
    // ]
  },
};
