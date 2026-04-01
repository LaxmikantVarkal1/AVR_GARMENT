"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SizesTodoProps {
  items: string[];
  userRole?: string;
  onUpdate: (newItems: string[]) => void;
}

export function SizesTodo({ items, userRole = "admin", onUpdate }: SizesTodoProps) {
  const isAdmin = userRole === "admin" || !userRole;
  const [checkedItems] = useState<Set<number>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // ✅ Validation for "string:number" or "number:number"
  const isValidSize = (value: string): boolean => {
    const regex = /^[A-Za-z0-9]+:\d+$/; // allows S:200 or 34:299
    return regex.test(value.trim());
  };

  // ✅ Duplicate check (case-insensitive)
  const isDuplicate = (value: string): boolean => {
    return items.some(
      (item) => item.trim().toLowerCase() === value.trim().toLowerCase()
    );
  };

  const handleAdd = () => {
    const value = inputValue.trim();

    if (!value) {
      setError("Size value is required");
      return;
    }

    if (isDuplicate(value)) {
      setError("Duplicate size not allowed");
      return;
    }

    if (!isValidSize(value)) {
      setError('Invalid format. Use "string:number" or "number:number" (e.g. S:200, 34:299)');
      return;
    }

    onUpdate([...items, value]);
    setInputValue("");
    setError("");
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
    setError(""); // ✅ clear error when removing item
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(""); // ✅ clear error when user starts typing again
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Field */}
      {isAdmin && (
        <div className="flex flex-col gap-2">
          {(userRole === "admin") && <div className="flex gap-2">
            <input
              type="text"
              placeholder='Enter size like "S:200" or "34:299"'
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2",
                error
                  ? "border-red-500 focus:ring-red-300"
                  : "border-input focus:ring-primary/30"
              )}
            />
            <Button onClick={handleAdd} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>}

          {/* Inline Error */}
          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>
      )}

      {/* List of Sizes */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sizes added yet
          </p>
        ) : (
          items.map((item, index) => {
            const parts = item.split(':');
            const sizeLabel = parts[0];
            const sizeCount = parts[1] || "-";
            const cuttedCount = parts[2] || "";

            return (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent transition-colors"
              >
                <div
                  className={cn(
                    "flex-1 font-mono text-sm flex items-center justify-between",
                    checkedItems.has(index) && "line-through text-muted-foreground"
                  )}
                >
                  <span>{sizeLabel}:{sizeCount}</span>
                  {userRole === "cutting" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Cutted:</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={cuttedCount}
                        onChange={(e) => {
                          const newCutted = e.target.value;
                          const newItems = [...items];
                          // Preserve the base string
                          newItems[index] = `${sizeLabel}:${sizeCount}${newCutted ? `:${newCutted}` : ""}`;
                          onUpdate(newItems);
                        }}
                        className="w-16 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemove(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Total: {items.length} sizes | Completed: {checkedItems.size}
          </p>
        </div>
      )}
    </div>
  );
}
