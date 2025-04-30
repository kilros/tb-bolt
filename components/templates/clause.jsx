"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Editable, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  Transforms,
  createEditor,
} from "slate";

import { Element, Leaf } from "./components.jsx";
import { clause1 } from "../../utils/constants.js";

export default function Clause({
  status = 0,
  content = clause1,
  index = 0,
  setContent = () => { },
  setEditor,
  readOnly = false,
}) {

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback(
    (props) => <Leaf {...props} status={status} />, [status]
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const handlePaste = useCallback(
    () => {
      Transforms.insertText(editor, " ")
      Transforms.delete(editor, { unit: "character", reverse: true });
    },
    [editor]
  );

  const handleSelect = useCallback(() => {
    const { selection } = editor;

    if (selection) {
      setEditor({ editor: editor })
    }
  }, []);

  useEffect(() => {
    editor.children = content;
  }, [content])

  return (
    <div>
      <Slate
        key={JSON.stringify(content)}
        editor={editor}
        initialValue={content}
        onValueChange={(data) => { setContent(index, data); }}
      >
        <div
          className={`flex flex-col min-h-[50px]`}
        >
          <div className="px-12 text-black">
            <Editable
              readOnly={readOnly}
              onPaste={handlePaste}
              onSelect={handleSelect}
              style={{ outline: "none" }}
              placeholder="Enter Your Content ..."
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              spellCheck
              autoFocus
            />
          </div>
        </div>
      </Slate>
    </div>
  );
}


