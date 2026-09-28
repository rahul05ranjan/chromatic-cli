import { Context } from '../../../types';
import buildPassed from './buildPassed';

export default {
  title: 'CLI/Messages/Info',
};

const webUrl = 'https://www.chromatic.com/build?appId=59c59bd0183bd100364e1d57&number=42';
const setupUrl = 'https://www.chromatic.com/setup?appId=59c59bd0183bd100364e1d57';
const features = { uiTests: true, uiReview: false, isReactNativeApp: false };
const firstBuild = {
  number: 1,
  testCount: 10,
  componentCount: 5,
  specCount: 8,
  actualCaptureCount: 20,
};

const story =
  (build: Partial<Context['build']>, ctx: Partial<Context> = {}) =>
  () =>
    buildPassed({
      options: {},
      ...ctx,
      build: {
        number: 42,
        status: 'PASSED',
        reviewableChangeCount: 0,
        ignoredCount: 0,
        autoAcceptChanges: false,
        webUrl,
        features,
        app: { setupUrl },
        ...build,
      },
    } as Context);

export const BuildPassed = story({});

export const BuildAutoAccepted = story({
  status: 'ACCEPTED',
  autoAcceptChanges: true,
  reviewableChangeCount: 2,
});

export const BuildPassedWithPendingChanges = story({ status: 'PENDING', reviewableChangeCount: 2 });

export const BuildPassedWithPendingAccessibilityChanges = story({
  status: 'PENDING',
  reviewableChangeCount: 2,
  features: { ...features, accessibilityTests: { enabled: true } },
});

export const BuildPassedWithIgnoredTests = story({ ignoredCount: 3 });

export const FirstBuildPassed = story(firstBuild, { isOnboarding: true });

export const FirstBuildPassedWithIgnoredTests = story(
  { ...firstBuild, ignoredCount: 1 },
  { isOnboarding: true }
);
