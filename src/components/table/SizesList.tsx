import { cn } from "@/lib/utils";

interface SizeItem {
    size: string;
    count: string | number;
    completed?: number;
}

interface SizesListProps {
    items: any[]; // string[] "S:200" or object[] {size, count}
    className?: string;
}

export function SizesList({ items, className }: SizesListProps) {

    if (!items || items.length === 0) {
        return <span className="text-xs text-muted-foreground">No sizes</span>;
    }

    const parsedItems: SizeItem[] & { cuttedCount?: number }[] = items.map((item) => {
        if (typeof item === "string") {
            const parts = item.split(":");
            return {
                size: parts[0],
                count: parts[1] || "-",
                cuttedCount: parts[2] ? Number(parts[2]) : undefined,
            };
        } else if (typeof item === "object" && item !== null) {
            return {
                size: item.size,
                count: item.count || "-",
                cuttedCount: item.cuttedCount,
            };
        }
        return { size: String(item), count: "-" };
    });

    // const hasCuttedCount = parsedItems.some(i => i.cuttedCount !== undefined);

    // Determine the number of columns based on existing properties
    // const cols = 2;
    const gridColsClass = "grid-cols-2";

    return (
        <div className={cn("border rounded-md overflow-hidden text-xs", className)}>
            <div className={`grid ${gridColsClass} bg-muted/50 p-1.5 font-medium text-center text-muted-foreground border-b`}>
                <div>Size</div>
                <div>Count/Cutted</div>
            </div>
            <div className="divide-y bg-background">
                {parsedItems.map((item: any, index) => (
                    <div key={index} className={`grid ${gridColsClass} p-1.5 text-center hover:bg-muted/30 transition-colors`}>
                        <div className="font-medium truncate px-1" title={item.size}>{item.size}</div>
                        <div className="text-primary truncate px-1 font-semibold" title={`${item.count}/${item.cuttedCount ?? 0}`}>
                            {item.count}/{item.cuttedCount ?? 0}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
