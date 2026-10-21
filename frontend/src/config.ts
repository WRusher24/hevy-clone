/**
 * Runtime configuration.
 *
 * Every value is optional and read through `process.env` so nothing sensitive
 * is ever committed. Create React App only inlines variables that start with
 * `REACT_APP_`, so keep that prefix when adding new ones.
 */
const env = process.env;

function readString(key: string, fallback: string): string {
  const raw = env[key];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export const config = {
  appName: readString("REACT_APP_APP_NAME", "Hevy Clone"),
  /**
   * Optional REST backend. When empty the app runs fully offline against
   * localStorage, which is the default for the Vercel deployment.
   */
  apiBaseUrl: readString("REACT_APP_API_BASE_URL", ""),
  /** Namespace for localStorage keys, useful for running several copies. */
  storageKey: readString("REACT_APP_STORAGE_KEY", "hevy-clone"),
  /** Set to "false" to boot with an empty account instead of demo content. */
  seedDemoData: readString("REACT_APP_SEED_DEMO_DATA", "true") !== "false",
  /** Optional public link used by the share button. Falls back to window.origin. */
  publicBaseUrl: readString("REACT_APP_PUBLIC_BASE_URL", ""),
  isConfiguredForRemoteApi: readString("REACT_APP_API_BASE_URL", "") !== "",
};
