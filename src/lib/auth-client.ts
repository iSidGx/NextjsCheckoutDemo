let refreshInFlight: Promise<boolean> | null = null;

async function refreshAuthSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
        });

        return response.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export async function fetchWithAuthRetry(input: RequestInfo | URL, init?: RequestInit) {
  const firstResponse = await fetch(input, {
    ...init,
    cache: init?.cache ?? "no-store",
  });

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const refreshed = await refreshAuthSession();

  if (!refreshed) {
    return firstResponse;
  }

  return fetch(input, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
}
