import React, { useEffect, useState } from "react";

/**
 * Shown while the browser reports no connection. The service worker keeps the
 * shell and the last good API responses, so the app still renders - this strip
 * is what stops that from being mistaken for fresh data.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status">
      You're offline — showing the last saved copy.
    </div>
  );
}
