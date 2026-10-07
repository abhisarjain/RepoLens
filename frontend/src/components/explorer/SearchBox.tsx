import { Search, X } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { SearchResult } from "../../utils/searchReadme";
import { SearchResults } from "./SearchResults";

interface SearchBoxProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchResult[];
  onSelect: (nodeId: string) => void;
}

export interface SearchBoxHandle {
  focus: () => void;
}

export const SearchBox = forwardRef<SearchBoxHandle, SearchBoxProps>(
  function SearchBox({ query, onQueryChange, results, onSelect }, forwardedRef) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    useImperativeHandle(forwardedRef, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const select = (nodeId: string) => {
      onSelect(nodeId);
      onQueryChange("");
      inputRef.current?.blur();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && results[0]) {
        event.preventDefault();
        select(results[0].node.id);
      }
      if (event.key === "Escape") {
        event.stopPropagation();
        onQueryChange("");
        inputRef.current?.blur();
      }
    };

    return (
      <div className="relative w-full max-w-[390px]">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="Search this README…"
          aria-label="Search this README"
          aria-expanded={focused && Boolean(query)}
          className="h-9 w-full rounded-lg border border-white/[0.09] bg-black/20 pl-9 pr-14 text-[13px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 hover:border-white/[0.14] focus:border-lens-400/45 focus:bg-black/30 focus:ring-2 focus:ring-lens-400/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-600 hover:text-slate-300"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/[0.09] bg-white/[0.025] px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
            /
          </kbd>
        )}
        {focused && query ? (
          <SearchResults query={query} results={results} onSelect={select} />
        ) : null}
      </div>
    );
  },
);
