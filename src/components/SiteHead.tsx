import { useEffect } from "react";
import { useSiteSettings } from "@/lib/cms/public";

/** Applies global head tags managed in the CMS (favicon). */
export function SiteHead() {
  const { general } = useSiteSettings();
  useEffect(() => {
    if (!general.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = general.faviconUrl;
  }, [general.faviconUrl]);
  return null;
}
