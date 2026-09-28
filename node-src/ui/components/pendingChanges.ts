import pluralize from 'pluralize';

import { Context } from '../../types';

// Mirrors `formatPendingMessage` in `lib/git-provider-content/formatUITestsCommitStatus.ts` in the
// chromatic monorepo. That function produces the UI Tests commit status description for a PENDING
// build, which the GitHub pull request comment embeds verbatim. Keep the wording in sync with it.
//
// Deliberate deviation: the monorepo appends " with N discussions" from a comment thread count that
// the CLI cannot query with a project token, so that suffix is omitted here.

interface FormatParameters {
  testCount: number;
  hasAccessibility: boolean;
}

export const formatPendingMessage = ({ testCount, hasAccessibility }: FormatParameters) => {
  const stringSuffix = pluralize('baseline', testCount);

  if (hasAccessibility) {
    return `${pluralize('visual and accessibility changes', testCount, true)} must be accepted as ${stringSuffix}`;
  }
  return `${pluralize('change', testCount, true)} must be accepted as ${stringSuffix}`;
};

type PendingChangesBuild = Pick<Context['build'], 'reviewableChangeCount' | 'features'>;

// The count is `testCount(statuses: [PENDING, ACCEPTED, DENIED])`, so ignored tests are excluded.
// The wording is a feature flag toggle, not a sum of per-kind counts, matching the commit status.
export const pendingChanges = (build: PendingChangesBuild) =>
  formatPendingMessage({
    testCount: build.reviewableChangeCount ?? 0,
    hasAccessibility: build.features?.accessibilityTests?.enabled ?? false,
  });
