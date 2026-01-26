"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { partiesAtom } from "@/store/atoms";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import GridHeader from "./gridHeader";

export default function GridView() {
    const parties = useAtomValue(partiesAtom);
    const [searchQuery, setSearchQuery] = React.useState("");

    const allItems = React.useMemo(() => {
        const items: any[] = [];
        parties.forEach(party => {
            party.items?.forEach(item => {
                items.push({
                    ...item,
                    party_name: party.party_name
                });
            });
        });
        return items;
    }, [parties]);



    const filteredItems = React.useMemo(() => {
        if (!searchQuery) return allItems;
        return allItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allItems]);


    return (
        <div className="my-8 sm:my-12">
            <GridHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <Card key={`${item._internalId}-${index}`} className="hover:shadow-md transition-shadow">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-lg font-bold leading-tight">
                                        {item.name || "Unnamed Item"}
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-[10px] shrink-0">
                                        ID: {item.id || "N/A"}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">
                                    Party: {item.party_name || "Unknown"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                                    {item.description || "No description available."}
                                </p>
                                <div className="flex items-center gap-2 mt-4 pt-2 border-t">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                        Added: {formatDate(item.givenClothDate)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                        <p className="text-lg font-medium">No items found to display.</p>
                        <p className="text-sm">Start by adding items to your parties in the main dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
