import { describe, expect, it } from 'vitest';

import { formatPendingMessage, pendingChanges } from './pendingChanges';

const features = { uiTests: true, uiReview: false, isReactNativeApp: false };

describe('formatPendingMessage', () => {
  // Expected strings are pinned from the monorepo's commitStatusFromNextBuildStatus.test.ts so
  // the CLI wording matches the GitHub commit status and pull request comment.
  it.each([
    [1, false, '1 change must be accepted as baseline'],
    [2, false, '2 changes must be accepted as baselines'],
    [2, true, '2 visual and accessibility changes must be accepted as baselines'],
    [1, true, '1 visual and accessibility change must be accepted as baseline'],
  ])('formats %i changes with accessibility %s', (testCount, hasAccessibility, expected) => {
    expect(formatPendingMessage({ testCount, hasAccessibility })).toBe(expected);
  });
});

describe('pendingChanges', () => {
  it('uses the non-accessibility wording when features are absent', () => {
    expect(pendingChanges({ reviewableChangeCount: 2 })).toBe(
      '2 changes must be accepted as baselines'
    );
  });

  it('uses the non-accessibility wording when accessibility tests are disabled', () => {
    const build = {
      reviewableChangeCount: 2,
      features: { ...features, accessibilityTests: { enabled: false } },
    };

    expect(pendingChanges(build)).toBe('2 changes must be accepted as baselines');
  });

  it('uses the accessibility wording when accessibility tests are enabled', () => {
    const build = {
      reviewableChangeCount: 2,
      features: { ...features, accessibilityTests: { enabled: true } },
    };

    expect(pendingChanges(build)).toBe(
      '2 visual and accessibility changes must be accepted as baselines'
    );
  });
});
