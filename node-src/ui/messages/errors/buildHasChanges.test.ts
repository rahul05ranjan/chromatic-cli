import { describe, expect, it } from 'vitest';

import buildHasChanges from './buildHasChanges';

const webUrl = 'https://www.chromatic.com/build?appId=59c59bd0183bd100364e1d57&number=42';
const setupUrl = 'https://www.chromatic.com/setup?appId=59c59bd0183bd100364e1d57';

const message = (
  build: {
    changeCount?: number;
    accessibilityChangeCount?: number;
    ignoredCount?: number;
    webUrl?: string;
  },
  isOnboarding = false
) =>
  buildHasChanges({
    build: {
      number: 42,
      changeCount: 0,
      accessibilityChangeCount: 0,
      ignoredCount: 0,
      webUrl,
      app: { setupUrl },
      ...build,
    },
    exitCode: 1,
    isOnboarding,
  });

describe('buildHasChanges ignored tests line', () => {
  it('links ignored tests to the expanded build page', () => {
    expect(message({ ignoredCount: 1 })).toContain(
      `1 test was ignored in this build. Review at ${webUrl}&expandIgnored=true\n`
    );
  });

  it('points ignored tests at the untouched setup page while onboarding', () => {
    const output = message({ changeCount: 2, ignoredCount: 1 }, true);

    expect(output).toContain(`1 test was ignored in this build. Review at ${setupUrl}\n`);
    expect(output).not.toContain('expandIgnored');
  });
});

describe('buildHasChanges change lines', () => {
  it.each([
    [1, '1 visual change must be accepted as baseline'],
    [2, '2 visual changes must be accepted as baselines'],
  ])('reports %i visual changes on their own', (changeCount, expected) => {
    const output = message({ changeCount });

    expect(output).toContain(`${expected}. Review at ${webUrl}`);
    expect(output).not.toContain('accessibility');
  });

  it.each([
    [1, '1 accessibility change must be accepted as baseline'],
    [2, '2 accessibility changes must be accepted as baselines'],
  ])('reports %i accessibility changes on their own', (accessibilityChangeCount, expected) => {
    const output = message({ accessibilityChangeCount });

    expect(output).toContain(`${expected}. Review at ${webUrl}`);
    expect(output).not.toContain('visual');
  });

  it('groups both kinds into a single total', () => {
    expect(message({ changeCount: 2, accessibilityChangeCount: 1 })).toContain(
      `3 visual and accessibility changes must be accepted as baselines. Review at ${webUrl}`
    );
  });

  it('points changes at the setup page while onboarding', () => {
    expect(message({ changeCount: 2 }, true)).toContain(
      `2 visual changes must be accepted as baselines. Review at ${setupUrl}`
    );
  });

  it('separates the change and ignored lines with a blank line', () => {
    expect(message({ changeCount: 2, ignoredCount: 1 })).toContain(`&expandIgnored=true`);
    expect(message({ changeCount: 2, ignoredCount: 1 })).toMatch(
      /must be accepted as baselines\. Review at \S+\n\n1 test was ignored/
    );
  });

  it('omits the change line when only tests were ignored', () => {
    const output = message({ ignoredCount: 1 });

    expect(output).not.toContain('must be accepted');
    expect(output).toContain('1 test was ignored in this build.');
  });

  it('always includes the CI/CD exit code guidance', () => {
    expect(message({ changeCount: 2 })).toContain(
      'For CI/CD use cases, this command failed with exit code 1'
    );
  });
});
