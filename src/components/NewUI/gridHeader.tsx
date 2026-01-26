"use client";

import * as React from "react";
import { useAtom, useAtomValue } from "jotai";
import { Search, XIcon, Plus } from "lucide-react";
import { allowedRoles, partiesAtom, userRoleAtom } from "@/store/atoms";
import { type UserRole } from "@/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "../ui/sheet";
import { Label } from "../ui/label";

interface GridHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function GridHeader({ searchQuery, setSearchQuery }: GridHeaderProps) {
    const [userRole, setUserRole] = useAtom(userRoleAtom);
    const [parties, setParties] = useAtom(partiesAtom);
    const roles = useAtomValue(allowedRoles);

    const [newPartyName, setNewPartyName] = React.useState("");
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const handleAddParty = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPartyName.trim()) return;

        const newPartyId = parties.length > 0 ? Math.max(...parties.map(p => p.id)) + 1 : 1;
        const newParty = {
            id: newPartyId,
            party_name: newPartyName,
            items: [
                {
                    _internalId: crypto.randomUUID(),
                    id: "",
                    name: "",
                    description: "",
                    recived: "",
                    cuttting: "",
                    sizes: [],
                    user: [],
                    collected: "",
                },
            ],
        };

        setParties([...parties, newParty]);
        setNewPartyName("");
        setIsSheetOpen(false);
    };

    return (
        <div className="my-5 mx-5 flex justify-start items-center">
            <div className="flex items-center justify-start h-16 w-full flex-row gap-4 sticky top-0 bg-background z-20">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by party, item, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setSearchQuery("")}
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {userRole === "admin" && (
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add Row</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Add New Party</SheetTitle>
                                <SheetDescription>
                                    Enter the details of the new party here. Click save when you're done.
                                </SheetDescription>
                            </SheetHeader>
                            <form onSubmit={handleAddParty} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="partyName">Party Name</Label>
                                    <Input
                                        id="partyName"
                                        placeholder="Enter party name"
                                        value={newPartyName}
                                        onChange={(e) => setNewPartyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <SheetFooter className="mt-4">
                                    <Button type="submit" className="w-full">Save Party</Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                )}

                <div className="hidden sm:block">
                    <Select
                        value={userRole}
                        onValueChange={(value: UserRole) => setUserRole(value)}
                    >
                        <SelectTrigger id="role-select" className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((r: any) => (
                                <SelectItem key={r} value={r}>
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
