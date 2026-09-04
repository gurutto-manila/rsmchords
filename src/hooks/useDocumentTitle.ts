import { useEffect } from 'react';

const SITE_NAME = 'RSMChords';

/** Sets the browser tab title for the current page; restores the previous title on unmount. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Worship together. Serve together.`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
