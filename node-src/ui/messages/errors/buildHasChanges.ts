import chalk from 'chalk';
import pluralize from 'pluralize';
import { dedent } from 'ts-dedent';

import { error, info } from '../../components/icons';
import ignoredTests from '../../components/ignoredTests';
import link from '../../components/link';

export default ({ build, exitCode, isOnboarding }) => {
  const url = isOnboarding ? build.app.setupUrl : build.webUrl;

  const changeKinds = [
    build.changeCount > 0 && 'visual',
    build.accessibilityChangeCount > 0 && 'accessibility',
  ].filter(Boolean);
  const changeTotal = (build.changeCount || 0) + (build.accessibilityChangeCount || 0);

  const changesLine =
    changeTotal > 0 &&
    chalk`${error} {bold ${pluralize(`${changeKinds.join(' and ')} changes`, changeTotal, true)} must be accepted as ${pluralize('baseline', changeTotal)}.} Review at ${link(url)}`;

  const ignoredLine = ignoredTests({ ignoredCount: build.ignoredCount, url, isOnboarding });

  return dedent(chalk`
    ${[changesLine, ignoredLine].filter(Boolean).join('\n\n')}

    ${info} For CI/CD use cases, this command failed with exit code ${exitCode}
    Pass {bold --exit-zero-on-changes} to succeed this command regardless of changes.
    Pass {bold --auto-accept-changes} to succeed and automatically accept any changes.
  `);
};
