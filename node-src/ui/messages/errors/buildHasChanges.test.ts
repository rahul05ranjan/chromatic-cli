import { describe, expect, it } from 'vitest';

import buildHasChanges from './buildHasChanges';

const webUrl = 'https://www.chromatic.com/build?appId=59c59bd0183bd100364e1d57&number=42';
const setupUrl = 'https://www.chromatic.com/setup?appId=59c59bd0183bd100364e1d57';
const features = { uiTests: true, uiReview: false, isReactNativeApp: false };

const message = (
  build: {
    reviewableChangeCount?: number;
    changeCount?: number;
    ignoredCount?: number;
    webUrl?: string;
    features?: typeof features & { accessibilityTests?: { enabled: boolean } };
  },
  isOnboarding = false
) =>
  buildHasChanges({
    build: {
      number: 42,
      reviewableChangeCount: 0,
      ignoredCount: 0,
      webUrl,
      app: { setupUrl },
      features,
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
    const output = message({ reviewableChangeCount: 2, ignoredCount: 1 }, true);

    expect(output).toContain(`1 test was ignored in this build. Review at ${setupUrl}\n`);
    expect(output).not.toContain('expandIgnored');
  });
});

describe('buildHasChanges changes line', () => {
  it.each([
    [1, '1 change must be accepted as baseline'],
    [2, '2 changes must be accepted as baselines'],
  ])('reports %i reviewable changes', (reviewableChangeCount, expected) => {
    expect(message({ reviewableChangeCount })).toContain(`${expected}. Review at ${webUrl}`);
  });

  it('uses the accessibility wording when accessibility tests are enabled', () => {
    const output = message({
      reviewableChangeCount: 2,
      features: { ...features, accessibilityTests: { enabled: true } },
    });

    expect(output).toContain(
      `2 visual and accessibility changes must be accepted as baselines. Review at ${webUrl}`
    );
  });

  it('does not count ignored tests as changes', () => {
    expect(message({ reviewableChangeCount: 1, ignoredCount: 2 })).toMatch(
      /1 change must be accepted as baseline\. Review at \S+\n\n2 tests were ignored/
    );
  });

  it('points changes at the setup page while onboarding', () => {
    expect(message({ reviewableChangeCount: 2 }, true)).toContain(
      `2 changes must be accepted as baselines. Review at ${setupUrl}`
    );
  });

  it('ignores changeCount, which includes ignored tests', () => {
    const output = message({ changeCount: 99, reviewableChangeCount: 1 });

    expect(output).toContain('1 change must be accepted as baseline');
    expect(output).not.toContain('99');
  });

  it('always includes the CI/CD exit code guidance', () => {
    expect(message({ reviewableChangeCount: 2 })).toContain(
      'For CI/CD use cases, this command failed with exit code 1'
    );
  });
});
