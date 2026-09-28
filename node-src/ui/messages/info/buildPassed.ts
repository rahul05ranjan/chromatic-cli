import chalk from 'chalk';
import pluralize from 'pluralize';
import { dedent } from 'ts-dedent';

import { isE2EBuild } from '../../../lib/e2eUtils';
import { Context } from '../../../types';
import { info, success } from '../../components/icons';
import ignoredTests from '../../components/ignoredTests';
import link from '../../components/link';
import { pendingChanges } from '../../components/pendingChanges';
import { stats } from '../../tasks/snapshot';

const changesLine = (build: Context['build']) => {
  const reviewableChangeCount = build.reviewableChangeCount ?? 0;

  if (reviewableChangeCount < 1) {
    return 'No changes were found in this build.';
  }
  if (build.autoAcceptChanges) {
    return `Auto-accepted ${pluralize('change', reviewableChangeCount, true)}.`;
  }
  return `${pendingChanges(build)}.`;
};

export default (ctx: Context) => {
  const { build, isOnboarding } = ctx;
  const url = isOnboarding ? build.app.setupUrl : build.webUrl;
  const ignoredLine = ignoredTests({ ignoredCount: build.ignoredCount, url, isOnboarding });

  if (isOnboarding) {
    const { snapshots, components, stories, e2eTests } = stats({ build });
    const foundString = isE2EBuild(ctx.options)
      ? `We found ${e2eTests} and captured ${snapshots}.`
      : `We found ${components} with ${stories} and captured ${snapshots}.`;

    return dedent(chalk`
      ${success} {bold Build passed. Welcome to Chromatic!}
      ${[foundString, ignoredLine].filter(Boolean).join('\n')}
      ${info} Please continue setup at ${link(build.app.setupUrl)}
    `);
  }

  return dedent(chalk`
    ${success} {bold Build ${build.number} passed!}
    ${[changesLine(build), ignoredLine].filter(Boolean).join('\n')}
    ${info} View build details at ${link(build.webUrl)}
  `);
};
