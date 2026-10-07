import type { ReadmeContent, ReadmeList, ReadmeListItem } from "../../types/readme";
import { InlineMarkdown, plainText } from "./InlineMarkdown";

function itemText(item: ReadmeListItem | string): string {
  if (typeof item === "string") return item;
  return item.text ?? item.content ?? item.rawMarkdown ?? plainText(item);
}

function StructuredList({ list, depth = 0 }: { list: ReadmeList; depth?: number }) {
  const Tag = list.ordered ? "ol" : "ul";
  return (
    <Tag
      start={list.ordered ? list.start : undefined}
      className={`${list.ordered ? "list-decimal" : "list-disc"} space-y-2 pl-5 marker:text-slate-600`}
    >
      {list.items.map((item, index) => (
        <li key={`${depth}-${index}`} className="pl-1 text-[14px] leading-6 text-slate-300">
          <InlineMarkdown>{itemText(item)}</InlineMarkdown>
          {typeof item !== "string"
            ? item.children?.map((child, childIndex) => (
                <div key={childIndex} className="mt-2">
                  <StructuredList list={child} depth={depth + 1} />
                </div>
              ))
            : null}
        </li>
      ))}
    </Tag>
  );
}

export function ListRenderer({ block }: { block: ReadmeContent }) {
  if (block.list) return <StructuredList list={block.list} />;
  if (block.items?.length) {
    return (
      <StructuredList
        list={{
          ordered: block.type === "ordered-list" || block.ordered === true,
          items: block.items.map((item) =>
            typeof item === "string" ? { text: item } : item,
          ),
        }}
      />
    );
  }
  const source = block.rawMarkdown ?? block.text ?? "";
  return source ? (
    <div className="readme-list text-sm leading-6 text-slate-300">
      <InlineMarkdown>{source}</InlineMarkdown>
    </div>
  ) : null;
}
