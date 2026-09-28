import chalk from 'chalk';
import { dedent } from 'ts-dedent';

import { error, info } from '../../components/icons';
import ignoredTests from '../../components/ignoredTests';
import link from '../../components/link';
import { pendingChanges } from '../../components/pendingChanges';

export default ({ build, exitCode, isOnboarding }) => {
  const url = isOnboarding ? build.app.setupUrl : build.webUrl;
  const changesLine = chalk`${error} {bold ${pendingChanges(build)}.} Review at ${link(url)}`;
  const ignoredLine = ignoredTests({ ignoredCount: build.ignoredCount, url, isOnboarding });

  return dedent(chalk`
    ${[changesLine, ignoredLine].filter(Boolean).join('\n\n')}

    ${info} For CI/CD use cases, this command failed with exit code ${exitCode}
    Pass {bold --exit-zero-on-changes} to succeed this command regardless of changes.
    Pass {bold --auto-accept-changes} to succeed and automatically accept any changes.
  `);
};
