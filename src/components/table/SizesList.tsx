import { cn } from "@/lib/utils";

interface SizeItem {
    size: string;
    count: string | number;
}

interface SizesListProps {
    items: any[]; // string[] "S:200" or object[] {size, count}
    className?: string;
}

export function SizesList({ items, className }: SizesListProps) {
    if (!items || items.length === 0) {
        return <span className="text-xs text-muted-foreground">No sizes</span>;
    }

    const parsedItems: SizeItem[] = items.map((item) => {
        if (typeof item === "string") {
            const parts = item.split(":");
            return {
                size: parts[0],
                count: parts[1] || "-",
            };
        } else if (typeof item === "object" && item !== null) {
            return {
                size: item.size,
                count: item.count || "-",
            };
        }
        return { size: String(item), count: "-" };
    });

    return (
        <div className={cn("border rounded-md overflow-hidden text-xs", className)}>
            <div className="grid grid-cols-2 bg-muted/50 p-1.5 font-medium text-center text-muted-foreground border-b">
                <div>Size</div>
                <div>Count</div>
            </div>
            <div className="divide-y bg-background">
                {parsedItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 p-1.5 text-center hover:bg-muted/30 transition-colors">
                        <div className="font-medium truncate px-1" title={item.size}>{item.size}</div>
                        <div className="text-muted-foreground truncate px-1" title={String(item.count)}>{item.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
