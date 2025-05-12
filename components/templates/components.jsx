import React from "react"
import { cx, css } from '@emotion/css'

import {
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

// eslint-disable-next-line react/display-name
const Button = React.forwardRef(
  (
    {
      className,
      active,
      ...props
    },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          padding: 5px 8px;
          background: ${active
            ? '#374151'
            : 'none'
          }

        `
      )}
    />
  )
)

// eslint-disable-next-line react/display-name
const Icon = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        'material-icons',
        className,
        css`
          font-size: 20px;
          vertical-align: text-bottom;
        `
      )}
    />
  )
)

// eslint-disable-next-line react/display-name
const Menu = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={cx(
        className,
        css`
          & > * {
            display: inline-block;
          }
        `
      )}
    >
      <MarkButton format="bold" icon="format_bold" editor={props.editor} />
      <MarkButton format="italic" icon="format_italic" editor={props.editor} />
      <MarkButton format="underline" icon="format_underlined" editor={props.editor} />
      <MarkButton format="strikethrough" icon="format_strikethrough" editor={props.editor} />
      <MarkButton format="code" icon="code" editor={props.editor} />
      <BlockButton format="heading-one" icon="looks_one" editor={props.editor} />
      <BlockButton format="heading-two" icon="looks_two" editor={props.editor} />
      <BlockButton format="block-quote" icon="format_quote" editor={props.editor} />
      <BlockButton format="numbered-list" icon="format_list_numbered" editor={props.editor} />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" editor={props.editor} />
      <BlockButton format="left" icon="format_align_left" editor={props.editor} />
      <BlockButton format="center" icon="format_align_center" editor={props.editor} />
      <BlockButton format="right" icon="format_align_right" editor={props.editor} />
      <BlockButton format="justify" icon="format_align_justify" editor={props.editor} />
    </div>
  )
)

// eslint-disable-next-line react/display-name
export const Toolbar = React.forwardRef(
  (
    { className, ...props },
    ref
  ) => (
    <Menu
      {...props}
      ref={ref}
      className={className}
    />
  )
)

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );

  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties = {};
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  try {
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n[blockType] === format,
      })
    );

    return !!match;
  } catch {
    return false;
  }
};

const isMarkActive = (editor, format) => {
  try {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  } catch {
    return false;
  }
};

export const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

export const Leaf = ({ attributes, children, leaf, status }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.highlight) {
    if (status < 2) {
      children = <mark>{children}</mark>;
    } else {
      children = <span>{children}</span>;
    }
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon, editor }) => {
  return (
    <Button
      className="hover:bg-[#1d2030] rounded-sm"
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon, editor }) => {
  return (
    <Button
      className="hover:bg-[#1d2030] rounded-sm"
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};