import { getListNestingStyles } from "draftjs-conductor";
import React, { useEffect, useRef } from "react";

interface ListNestingStylesProps {
  max?: number;
}

/**
 * Injects CSS styles for list items using adoptedStyleSheets API.
 */
function Styles({ max }: ListNestingStylesProps) {
  const sheetRef = useRef<CSSStyleSheet | null>(null);

  useEffect(() => {
    if (!max) return;
    if (!sheetRef.current) {
      sheetRef.current = new CSSStyleSheet();
      sheetRef.current.replaceSync(getListNestingStyles(max));
    }

    if (!document.adoptedStyleSheets.includes(sheetRef.current)) {
      document.adoptedStyleSheets.push(sheetRef.current);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      // Remove the sheet when unmounting or max changes
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== sheetRef.current,
      );
    };
  }, [max]);

  return null;
}

const ListNestingStyles = React.memo(Styles);

export default ListNestingStyles;
