import React, { useEffect } from "react";
import { BLOCK_TYPE } from "../../api/constants";
import { BlockTypeControl } from "../../api/types";
import { getControlDescription } from "../../api/ui";

interface PlaceholderStylesProps {
  blockKey: string | null;
  blockTypes: ReadonlyArray<BlockTypeControl>;
  placeholder?: string | null;
}

/**
 * Adds placeholder "Write here…" text to the currently-focused block, and to empty non-list-item blocks.
 * Done with CSS so this can switch blocks without re-rendering the whole editor.
 */
function Styles({ blockKey, blockTypes, placeholder }: PlaceholderStylesProps) {
  useEffect(() => {
    // Set placeholder for the currently focused block
    if (blockKey && placeholder) {
      const focusedBlock = document.querySelector(
        `.Draftail-block--unstyled.Draftail-block--empty[data-offset-key="${blockKey}-0-0"]`,
      );
      if (focusedBlock) {
        focusedBlock.setAttribute("data-placeholder", placeholder);
      }
    }

    // Set placeholders for different block types
    blockTypes.forEach((blockType) => {
      // Skip paragraph blocks and list items
      if (
        blockType.type === BLOCK_TYPE.UNSTYLED ||
        blockType.type.endsWith("-list-item")
      ) {
        return;
      }

      const description = getControlDescription(blockType);
      if (description) {
        const blocks = document.querySelectorAll(
          `.Draftail-block--${blockType.type}.Draftail-block--empty`,
        );
        blocks.forEach((block) => {
          block.setAttribute("data-placeholder", description);
        });
      }
    });

    // Cleanup function to remove data attributes when component unmounts
    return () => {
      // Clean up all placeholders - use a single selector since they all use the same styling
      const allPlaceholderBlocks = document.querySelectorAll(
        ".Draftail-block--empty[data-placeholder]",
      );
      allPlaceholderBlocks.forEach((block) => {
        block.removeAttribute("data-placeholder");
      });
    };
  }, [blockKey, blockTypes, placeholder]);

  return null;
}

const PlaceholderStyles = React.memo(Styles);

export default PlaceholderStyles;
