import React from "react";
import {
  ContentBlock,
  ContentState,
  EditorState,
  genKey,
  SelectionState,
} from "draft-js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { List, Map as ImmutableMap } from "immutable";

export interface TableWrapperProps {
  children?: React.ReactNode;
  /** Accessor for the current editor state. Required for table controls. */
  getEditorState?: () => EditorState;
  /** Callback to update the editor state. Required for table controls. */
  onChange?: (editorState: EditorState) => void;
}

interface BlockLike {
  getDepth: () => number;
  getKey: () => string;
}

interface TableBlock {
  block: BlockLike;
  child: React.ReactElement;
}

/** Parsed table: rows x columns of block references. */
type ParsedTable = TableBlock[][][];

function getBlock(child: React.ReactElement): BlockLike {
  return (
    child.props as {
      children: { props: { block: BlockLike } };
    }
  ).children.props.block;
}

/**
 * Parse children into a structured tables array.
 */
function parseTables(children: React.ReactNode) {
  const tables: ParsedTable = [];
  let tablesCount = -1;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const block = getBlock(child);
    const depth = block.getDepth();

    if (depth === 0) {
      tablesCount += 1;
    }

    const column = depth % 100;
    const row = Math.floor(depth / 100);

    if (!tables[tablesCount]) {
      tables[tablesCount] = [];
    }
    if (!tables[tablesCount][row]) {
      tables[tablesCount][row] = [];
    }

    tables[tablesCount][row][column] = { block, child };
  });

  return tables;
}

/**
 * Collect all block keys belonging to one parsed table, in document order.
 */
function getTableBlockKeys(table: TableBlock[][]): string[] {
  return table.reduce<string[]>(
    (keys, row) =>
      row.reduce((acc, cell) => {
        if (cell) acc.push(cell.block.getKey());
        return acc;
      }, keys),
    [],
  );
}

/**
 * Get the number of columns in a table (max across all rows).
 */
function getColumnCount(table: TableBlock[][]): number {
  return table.reduce((max, row) => Math.max(max, row.length), 0);
}

/**
 * Create a new empty table-cell ContentBlock with the given depth.
 */
function createCellBlock(depth: number): ContentBlock {
  return new ContentBlock({
    key: genKey(),
    type: "table-cell",
    text: "",
    depth,
    characterList: List(),
    data: ImmutableMap(),
  });
}

/**
 * Rebuild the blockMap, replacing blocks for a given table with new ones.
 * `oldKeys` are the existing block keys to replace, `newBlocks` are the replacements.
 */
function replaceTableBlocks(
  content: ContentState,
  oldKeys: string[],
  newBlocks: ContentBlock[],
): ContentState {
  const blockMap = content.getBlockMap();
  const oldKeySet = new Set(oldKeys);

  const blockArray = blockMap.toArray();
  const firstIdx = blockArray.findIndex((b: ContentBlock) =>
    oldKeySet.has(b.getKey()),
  );

  // Split around old blocks and insert new ones.
  const before = blockArray.filter(
    (b: ContentBlock, i: number) => i < firstIdx && !oldKeySet.has(b.getKey()),
  );
  const after = blockArray.filter(
    (b: ContentBlock, i: number) => i >= firstIdx && !oldKeySet.has(b.getKey()),
  );

  const ordered = [...before, ...newBlocks, ...after];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newBlockMap = (blockMap.constructor as any)(
    ordered.map((b: ContentBlock) => [b.getKey(), b]),
  );

  return content.merge({ blockMap: newBlockMap }) as ContentState;
}

/**
 * Rebuild a table's blocks from a 2D grid of (existing block key | null for new cell).
 */
function buildTableBlocks(
  content: ContentState,
  grid: (string | null)[][],
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  grid.forEach((row, rowIdx) => {
    row.forEach((key, colIdx) => {
      const depth = rowIdx * 100 + colIdx;
      if (key) {
        const existing = content.getBlockForKey(key);
        if (existing) {
          blocks.push(existing.merge({ depth }) as ContentBlock);
          return;
        }
      }
      blocks.push(createCellBlock(depth));
    });
  });
  return blocks;
}

function toGrid(table: TableBlock[][]): (string | null)[][] {
  return table.map((row) =>
    row.map((cell) => (cell ? cell.block.getKey() : null)),
  );
}

function insertRow(
  getEditorState: () => EditorState,
  onChange: (s: EditorState) => void,
  table: TableBlock[][],
  afterRowIndex: number,
) {
  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const colCount = getColumnCount(table);
  const oldKeys = getTableBlockKeys(table);

  const grid = toGrid(table);
  const newRow: null[] = Array.from({ length: colCount }, () => null);
  grid.splice(afterRowIndex + 1, 0, newRow);

  const newBlocks = buildTableBlocks(content, grid);
  const newContent = replaceTableBlocks(content, oldKeys, newBlocks);

  const firstNewBlock = newBlocks[(afterRowIndex + 1) * colCount];
  const selection = new SelectionState({
    anchorKey: firstNewBlock.getKey(),
    anchorOffset: 0,
    focusKey: firstNewBlock.getKey(),
    focusOffset: 0,
  });

  let next = EditorState.push(editorState, newContent, "insert-fragment");
  next = EditorState.forceSelection(next, selection);
  onChange(next);
}

function deleteRow(
  getEditorState: () => EditorState,
  onChange: (s: EditorState) => void,
  table: TableBlock[][],
  rowIndex: number,
) {
  if (table.length <= 1) return;

  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const oldKeys = getTableBlockKeys(table);

  const grid = toGrid(table);
  grid.splice(rowIndex, 1);

  const newBlocks = buildTableBlocks(content, grid);
  const newContent = replaceTableBlocks(content, oldKeys, newBlocks);

  const focusRow = Math.min(rowIndex, grid.length - 1);
  const focusBlock = newBlocks[focusRow * getColumnCount(table)];
  const selection = new SelectionState({
    anchorKey: focusBlock.getKey(),
    anchorOffset: 0,
    focusKey: focusBlock.getKey(),
    focusOffset: 0,
  });

  let next = EditorState.push(editorState, newContent, "remove-range");
  next = EditorState.forceSelection(next, selection);
  onChange(next);
}

function insertColumn(
  getEditorState: () => EditorState,
  onChange: (s: EditorState) => void,
  table: TableBlock[][],
  afterColIndex: number,
) {
  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const oldKeys = getTableBlockKeys(table);

  const grid = toGrid(table);
  grid.forEach((row) => {
    row.splice(afterColIndex + 1, 0, null);
  });

  const newBlocks = buildTableBlocks(content, grid);
  const newContent = replaceTableBlocks(content, oldKeys, newBlocks);

  const focusBlock = newBlocks[afterColIndex + 1];
  const selection = new SelectionState({
    anchorKey: focusBlock.getKey(),
    anchorOffset: 0,
    focusKey: focusBlock.getKey(),
    focusOffset: 0,
  });

  let next = EditorState.push(editorState, newContent, "insert-fragment");
  next = EditorState.forceSelection(next, selection);
  onChange(next);
}

function deleteColumn(
  getEditorState: () => EditorState,
  onChange: (s: EditorState) => void,
  table: TableBlock[][],
  colIndex: number,
) {
  const colCount = getColumnCount(table);
  if (colCount <= 1) return;

  const editorState = getEditorState();
  const content = editorState.getCurrentContent();
  const oldKeys = getTableBlockKeys(table);

  const grid = toGrid(table);
  grid.forEach((row) => {
    row.splice(colIndex, 1);
  });

  const newBlocks = buildTableBlocks(content, grid);
  const newContent = replaceTableBlocks(content, oldKeys, newBlocks);

  const focusCol = Math.min(colIndex, grid[0].length - 1);
  const focusBlock = newBlocks[focusCol];
  const selection = new SelectionState({
    anchorKey: focusBlock.getKey(),
    anchorOffset: 0,
    focusKey: focusBlock.getKey(),
    focusOffset: 0,
  });

  let next = EditorState.push(editorState, newContent, "remove-range");
  next = EditorState.forceSelection(next, selection);
  onChange(next);
}

/**
 * Wraps consecutive table-cell blocks, grouping them into tables based on depth.
 *
 * Depth encoding:
 * - row = Math.floor(depth / 100)
 * - column = depth % 100
 * - A depth of 0 signals the start of a new table.
 *
 * When `getEditorState` and `onChange` are provided, renders row/column
 * insertion and deletion controls.
 */
const TableWrapper = ({
  children,
  getEditorState,
  onChange,
}: TableWrapperProps) => {
  const tables = parseTables(children);
  const hasControls = !!(getEditorState && onChange);

  return (
    <div className="Draftail-TableWrapper">
      {tables.map((table, tableIndex) => {
        const colCount = getColumnCount(table);

        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={tableIndex} className="Draftail-TableWrapper__container">
            <table className="Draftail-TableWrapper__table">
              {hasControls && (
                <thead>
                  <tr className="Draftail-TableWrapper__controls-row">
                    {Array.from({ length: colCount }, (_, colIdx) => (
                      <th
                        // eslint-disable-next-line react/no-array-index-key
                        key={colIdx}
                        className="Draftail-TableWrapper__col-controls"
                      >
                        <button
                          type="button"
                          className="Draftail-TableWrapper__btn Draftail-TableWrapper__btn--insert-col"
                          aria-label={`Insert column after column ${colIdx + 1}`}
                          title={`Insert column after column ${colIdx + 1}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            insertColumn(
                              getEditorState,
                              onChange,
                              table,
                              colIdx,
                            );
                          }}
                        >
                          +
                        </button>
                        {colCount > 1 && (
                          <button
                            type="button"
                            className="Draftail-TableWrapper__btn Draftail-TableWrapper__btn--delete-col"
                            aria-label={`Delete column ${colIdx + 1}`}
                            title={`Delete column ${colIdx + 1}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              deleteColumn(
                                getEditorState,
                                onChange,
                                table,
                                colIdx,
                              );
                            }}
                          >
                            ×
                          </button>
                        )}
                      </th>
                    ))}
                    {/* Extra header cell for row controls column */}
                    <th
                      className="Draftail-TableWrapper__col-controls"
                      aria-label="Row controls"
                    />
                  </tr>
                </thead>
              )}
              <tbody>
                {table.map((row, rowIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={rowIndex} className="Draftail-TableWrapper__tr">
                    {row.map((cell, cellIndex) => (
                      <td
                        // eslint-disable-next-line react/no-array-index-key
                        key={cellIndex}
                        className="Draftail-TableWrapper__td"
                      >
                        {cell.child}
                      </td>
                    ))}
                    {hasControls && (
                      <td className="Draftail-TableWrapper__row-controls">
                        <button
                          type="button"
                          className="Draftail-TableWrapper__btn Draftail-TableWrapper__btn--insert-row"
                          aria-label={`Insert row after row ${rowIndex + 1}`}
                          title={`Insert row after row ${rowIndex + 1}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            insertRow(
                              getEditorState,
                              onChange,
                              table,
                              rowIndex,
                            );
                          }}
                        >
                          +
                        </button>
                        {table.length > 1 && (
                          <button
                            type="button"
                            className="Draftail-TableWrapper__btn Draftail-TableWrapper__btn--delete-row"
                            aria-label={`Delete row ${rowIndex + 1}`}
                            title={`Delete row ${rowIndex + 1}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              deleteRow(
                                getEditorState,
                                onChange,
                                table,
                                rowIndex,
                              );
                            }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default TableWrapper;
