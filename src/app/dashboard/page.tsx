"use client";

import * as React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  Plus,
  Save as SaveIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  partiesAtom,
  searchQueryAtom,
  userRoleAtom,
  filteredPartiesAtom,
  partyNameOptionsAtom,
  itemNameOptionsAtom,
  itemIdOptionsAtom,
  updatePartyNameAtom,
  updateItemFieldAtom,
  addPartyNameOptionAtom,
  addItemNameOptionAtom,
  addItemIdOptionAtom,
  allUsersAtom,
  allowedRoles,
} from "@/store/atoms";
import { roleColumnConfig } from "@/constants";
import { type UserRole } from "@/types";
import { CreatableCombobox } from "@/components/table/CreatableCombobox";
import { DatePicker } from "@/components/table/DatePicker";
import { EditableTextarea } from "@/components/table/EditableTextarea";
import { TableNumberInput } from "@/components/table/TableNumberInput";
import { SizesTodo } from "@/components/table/SizesTodo";
import { SizesList } from "@/components/table/SizesList";
import { UserManager } from "@/components/table/UserManager";
import { fetchPartiesAtom, savePartiesAtom } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import UserProfile from "@/components/UserProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReceiptViewModal from "@/components/ui/preview";
import { Card, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import useKeepScrollXY from "../../hooks/useKeepScrollPosition"

export default function MainDashboard() {
  const [parties, setParties] = useAtom(partiesAtom);
  //setSearchQuery
  const [searchQuery] = useAtom(searchQueryAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  // const [activeTab, setActiveTab] = React.useState("dashboard");
  const filteredData = useAtomValue(filteredPartiesAtom);
  const scrollRef = useKeepScrollXY();

  const partyNameOptions = useAtomValue(partyNameOptionsAtom);
  const itemNameOptions = useAtomValue(itemNameOptionsAtom);
  const itemIdOptions = useAtomValue(itemIdOptionsAtom);

  const updatePartyName = useSetAtom(updatePartyNameAtom);
  const updateItemField = useSetAtom(updateItemFieldAtom);
  const addPartyNameOption = useSetAtom(addPartyNameOptionAtom);
  const addItemNameOption = useSetAtom(addItemNameOptionAtom);
  const addItemIdOption = useSetAtom(addItemIdOptionAtom);

  const columnVisibility = roleColumnConfig[userRole] || roleColumnConfig.admin;



  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(30);
  const [allUsers] = useAtom(allUsersAtom);
  const [role] = useAtom(allowedRoles);

  // Track expanded cards
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  // Mobile party filter
  const [mobilePartyFilter, setMobilePartyFilter] = React.useState("all");

  const uniquePartyNames = React.useMemo(() => {
    // using filteredData or parties? filteredData is likely what we want to filter further or just parties?
    // User said "dropdown contains list of parties" which usually implies all available parties.
    const names = new Set(parties.map((p) => p.party_name).filter(Boolean));
    return Array.from(names);
  }, [parties]);

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Flatten and paginate data
  const { paginatedData } = React.useMemo(() => {
    const flatData: Array<{
      party: any;
      item: any;
      partyIndex: number;
      itemIndex: number;
    }> = [];

    filteredData.forEach((party, partyIndex) => {
      party.items?.forEach((item, itemIndex) => {
        flatData.push({ party, item, partyIndex, itemIndex });
      });
    });

    const total = flatData.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = flatData.slice(startIndex, endIndex);

    return {
      paginatedData: paginated,
      totalItems: total,
      totalPages: pages,
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchedParties = useAtomValue(fetchPartiesAtom);
  const [, saveParties] = useAtom(savePartiesAtom);

  const handleSaveData = async () => {
    console.log("=== SAVED DATA ===");
    console.log("Current User Role:", userRole);
    console.log("Parties Data:", parties);
    console.log("fetchedParties Data from Supabase:", fetchedParties);
    await saveParties(1, parties);
    console.log(allUsers);
    console.log("==================");
  };

  const handleAddItem = (partyName: string) => {
    if (parties.length === 0) return;

    const PartyIndex = parties.findIndex((p) => p.party_name === partyName);
    const Party = parties[PartyIndex];

    const newItem = {
      _internalId: crypto.randomUUID(),
      id: "",
      name: "",
      description: "",
      recived: "",
      cuttting: "",
      sizes: [],
      user: [],
      collected: "",
    };
    const updatedParty = {
      ...Party,
      items: [...Party.items, newItem],
    };

    const updatedParties = [...parties];
    updatedParties[PartyIndex] = updatedParty;

    setParties(updatedParties);
  };

  const handleAddRow = () => {
    const newPartyId =
      parties.length > 0 ? parties[parties.length - 1].id + 1 : 1;
    const newParty = {
      id: newPartyId,
      party_name: "",
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
  };

  const handleDeleteItem = (partyId: number, internalItemId: string) => {
    const updatedParties = parties.map((party) => {
      if (party.id === partyId) {
        return {
          ...party,
          items: party.items.filter(
            (item) => item._internalId !== internalItemId
          ),
        };
      }
      return party;
    });

    setParties(updatedParties);
  };

  const getPartyBgClass = (partyIndex: number) => {
    return partyIndex % 2 === 0 ? "bg-background" : "bg-muted/30";
  };


  // Mobile Card Component
  const MobileItemCard = ({ party, item, partyIndex, itemIndex }: any) => {
    const cardId = `${party.id}-${item._internalId}`;
    const isExpanded = expandedCards.has(cardId);



    return (

      <Card className={`min-w-[320px] max-w-[320px] m-1.5 ${getPartyBgClass(partyIndex)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              {columnVisibility.partyName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Party Name</p>
                  {userRole === "collector" ? (
                    <div className="text-sm font-medium">{party.id}</div>
                  ) : (
                    <div className="flex gap-2">
                      {itemIndex === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const updatedParties = parties.filter(
                              (p) => p.id !== party.id
                            );
                            setParties(updatedParties);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <div className={"flex-1"}>
                        <CreatableCombobox
                          value={party.party_name}
                          onValueChange={(value) =>
                            updatePartyName({
                              partyId: party.id,
                              newName: value,
                            })
                          }
                          options={partyNameOptions}
                          onCreateOption={addPartyNameOption}
                          disabled={itemIndex != 0}
                          placeholder="Select party..."
                          searchPlaceholder="Search party..."
                          emptyText="No party found."
                          type="partyName"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {columnVisibility.itemId && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Item ID</p>
                  {userRole === "collector" ? (
                    <div className="text-sm font-medium">{item.id || "—"}</div>
                  ) : (
                    <div className="flex gap-2">
                      {itemIndex === party.items.length - 1 && userRole === "admin" && (
                        <Button
                          onClick={() => handleAddItem(party.party_name)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="flex-1">
                        <CreatableCombobox
                          value={item.id}
                          disabled={userRole !== "admin"}
                          type="itemId"
                          onValueChange={(value) =>
                            updateItemField({
                              partyId: party.id,
                              internalItemId: item._internalId,
                              field: "id",
                              value,
                            })
                          }
                          options={itemIdOptions}
                          onCreateOption={addItemIdOption}
                          placeholder="Select ID..."
                          searchPlaceholder="Search ID..."
                          emptyText="No ID found."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {columnVisibility.itemName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Item Name</p>
                  <CreatableCombobox
                    value={item.name}
                    type="itemName"
                    disabled={userRole !== "admin"}
                    onValueChange={(value) =>
                      updateItemField({
                        partyId: party.id,
                        internalItemId: item._internalId,
                        field: "name",
                        value,
                      })
                    }
                    options={itemNameOptions}
                    onCreateOption={addItemNameOption}
                    placeholder="Select item..."
                    searchPlaceholder="Search item..."
                    emptyText="No item found."
                  />
                </div>
              )}
            </div>

            {itemIndex !== 0 && userRole !== "collector" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => handleDeleteItem(party.id, item._internalId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Collapsible open={isExpanded} onOpenChange={() => toggleCard(cardId)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show More Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-3 mt-3">
              {columnVisibility.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <EditableTextarea
                    value={item.description}
                    label="Description"
                    disabled={userRole !== "admin"}
                    onSave={(value) =>
                      updateItemField({
                        partyId: party.id,
                        internalItemId: item._internalId,
                        field: "description",
                        value,
                      })
                    }
                  />
                </div>
              )}

              {columnVisibility.received && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Received</p>
                  {userRole === "collector" ? (
                    <div className="text-sm font-medium opacity-60">{item.recived || "—"}</div>
                  ) : (
                    <TableNumberInput
                      value={item.recived}
                      disabled={userRole !== "admin"}
                      onBlur={(value) =>
                        updateItemField({
                          partyId: party.id,
                          internalItemId: item._internalId,
                          field: "recived",
                          value,
                        })
                      }
                      placeholder="0"
                    />
                  )}
                </div>
              )}

              {columnVisibility.givenDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Given Date</p>
                  <DatePicker
                    date={item.givenClothDate}
                    onDateChange={(date) =>
                      updateItemField({
                        partyId: party.id,
                        internalItemId: item._internalId,
                        field: "givenClothDate",
                        value: date,
                      })
                    }
                    placeholder="Select given date"
                  />
                </div>
              )}

              {columnVisibility.cutting && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cutting</p>
                  {userRole === "collector" ? (
                    <div className="text-sm font-medium opacity-60">{item.cuttting || "—"}</div>
                  ) : (
                    <TableNumberInput
                      value={item.cuttting}
                      onBlur={(value) =>
                        updateItemField({
                          partyId: party.id,
                          internalItemId: item._internalId,
                          field: "cuttting",
                          value,
                        })
                      }
                      placeholder="0"
                    />
                  )}
                </div>
              )}

              {columnVisibility.cuttingDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cutting Date</p>
                  <DatePicker
                    date={item.cuttingDate}
                    onDateChange={(date) =>
                      updateItemField({
                        partyId: party.id,
                        internalItemId: item._internalId,
                        field: "cuttingDate",
                        value: date,
                      })
                    }
                    placeholder="Select cutting date"
                  />
                </div>
              )}

              {columnVisibility.collected && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {userRole === "collector" ? "Collected (Total)" : "Collected"}
                  </p>
                  {userRole === "collector" ? (
                    <div className="text-sm font-medium">
                      {(item.user || []).reduce(
                        (sum: number, userEntry: any) => sum + (userEntry.completed || 0),
                        0
                      )}
                    </div>
                  ) : (
                    <TableNumberInput
                      value={item.collected}
                      onBlur={(value) =>
                        updateItemField({
                          partyId: party.id,
                          internalItemId: item._internalId,
                          field: "collected",
                          value,
                        })
                      }
                      placeholder="0"
                    />
                  )}
                </div>
              )}

              {columnVisibility.collectDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Collect Date</p>
                  <DatePicker
                    date={item.collectDate}
                    onDateChange={(date) =>
                      updateItemField({
                        partyId: party.id,
                        internalItemId: item._internalId,
                        field: "collectDate",
                        value: date,
                      })
                    }
                    placeholder="Select collect date"
                  />
                </div>
              )}

              {columnVisibility.sizes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sizes</p>
                  <SizesList items={item.sizes} />
                  {userRole === "cutting" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Edit ({item.sizes.length} sizes)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Manage Sizes (Todo List)</DialogTitle>
                          <DialogDescription>
                            Add, check off, or delete sizes. Checked items are marked as complete.
                          </DialogDescription>
                        </DialogHeader>
                        <SizesTodo
                          items={item.sizes}
                          onUpdate={(newSizes) =>
                            updateItemField({
                              partyId: party.id,
                              internalItemId: item._internalId,
                              field: "sizes",
                              value: newSizes,
                            })
                          }
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}

              {columnVisibility.users && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Users</p>
                  {userRole === "collector" ? (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          {item.user?.length || 0} users
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-full sm:w-[380px] md:w-[480px] lg:w-[540px] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden"
                      >
                        <SheetHeader className="flex-shrink-0">
                          <SheetTitle>Users & Completed Items</SheetTitle>
                          <SheetDescription>
                            View users and their completed items (read-only).
                          </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
                          <div className="space-y-4">
                            {item.user && item.user.length > 0 ? (
                              <div className="space-y-3">
                                {item.user.map((userEntry: any, index: number) => {
                                  const getDisplayName = (user: any) => {
                                    return user?.display_name || user?.name || user?.email || user?.user || "Unknown User";
                                  };
                                  const getTotalCount = (entry: any) => {
                                    return (entry.sizes || []).reduce(
                                      (total: number, s: any) => total + (s.count || 0),
                                      0
                                    );
                                  };
                                  const totalItems = getTotalCount(userEntry);
                                  const completedItems = userEntry.completed || 0;

                                  return (
                                    <div key={index} className="border rounded-lg p-4 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">
                                          {getDisplayName(userEntry.user)}
                                        </h4>
                                        <Badge variant="secondary" className="text-xs">
                                          Menu: {userEntry.menuId || "N/A"}
                                        </Badge>
                                      </div>
                                      <div className="text-sm space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">Completed:</span>
                                          <span className="font-medium">
                                            {completedItems} / {totalItems}
                                          </span>
                                        </div>
                                        {userEntry.sizes && userEntry.sizes.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">Sizes:</p>
                                            <SizesList items={userEntry.sizes} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No users assigned</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          {item.user?.length || 0} users
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="w-full sm:w-[380px] md:w-[480px] lg:w-[540px] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden"
                      >
                        <SheetHeader className="flex-shrink-0">
                          <SheetTitle>Users & Completed Items</SheetTitle>
                          <SheetDescription>
                            View users and their completed items (can edit).
                          </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 flex flex-col">
                          <UserManager
                            users={item.user || []}
                            sizes={item.sizes.map((s: any) => ({
                              value: s,
                              label: s.split(":")[0],
                            }))}
                            onUpdate={(newUsers) =>
                              updateItemField({
                                partyId: party.id,
                                internalItemId: item._internalId,
                                field: "user",
                                value: newUsers,
                              })
                            }
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              )}

              {columnVisibility.print && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Print</p>
                  <ReceiptViewModal data={parties} filter={party.party_name} />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

    );
  };

  return (
    <div className="w-full flex flex-col p-6 pb-5 pt:2 md:pt-10">


      <div className="space-y-4">
        {/* Fixed Action Buttons */}
        <div className="flex items-center justify-end h-16 w-full flex-row gap-4 sticky top-0 bg-background z-20">
          {/* <div className="relative max-w-md">
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
            </div> */}
          {userRole === "admin" && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleAddRow}
                  size="lg"
                  className="gap-2 flex-1"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Row</span>
                </Button>
              </div>
            </div>
          )}
          {parties && userRole !== "users" && <ReceiptViewModal data={parties} filter={"all"} />}

          <Button
            onClick={handleSaveData}
            variant="secondary"
            className="gap-2 mr-auto hidden md:flex"
          >
            <SaveIcon className="h-5 w-5" />
            Save Data
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <UserProfile />
            </PopoverContent>
          </Popover>
          <div className="hidden sm:block">
            <Select
              value={userRole}
              onValueChange={(value: UserRole) => setUserRole(value)}
            >
              <SelectTrigger id="role-select" className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {role.map((r: any) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        {parties.length > 0 && (
          <div className="hidden md:block h-auto flex-col pb-5 overflow-hidden">
            <div className="rounded-md border flex-1 overflow-hidden flex flex-col">
              <div className="overflow-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      {columnVisibility.partyName && (
                        <TableHead className="w-auto bg-background sticky">
                          Party Name
                        </TableHead>
                      )}
                      {columnVisibility.itemId && (
                        <TableHead className="w-auto bg-background">
                          Item ID
                        </TableHead>
                      )}
                      {columnVisibility.itemName && (
                        <TableHead className="w-[150px] bg-background">
                          Item Name
                        </TableHead>
                      )}
                      {columnVisibility.description && (
                        <TableHead className="min-w-[200px] bg-background">
                          Description
                        </TableHead>
                      )}
                      {columnVisibility.received && (
                        <TableHead className="w-[120px] bg-background">
                          Received
                        </TableHead>
                      )}
                      {columnVisibility.givenDate && (
                        <TableHead className="w-[160px] bg-background">
                          Given Date
                        </TableHead>
                      )}
                      {columnVisibility.cutting && (
                        <TableHead className="w-[120px] bg-background">
                          Cutting
                        </TableHead>
                      )}
                      {columnVisibility.cuttingDate && (
                        <TableHead className="w-[160px] bg-background">
                          Cutting Date
                        </TableHead>
                      )}
                      {columnVisibility.collected && (
                        <TableHead className="w-[120px] bg-background">
                          {userRole === "collector" ? "Collected (Total)" : "Collected"}
                        </TableHead>
                      )}
                      {columnVisibility.collectDate && (
                        <TableHead className="w-[160px] bg-background">
                          Collect Date
                        </TableHead>
                      )}
                      {columnVisibility.sizes && (
                        <TableHead className="min-w-[200px] text-center bg-background">
                          Sizes
                        </TableHead>
                      )}
                      {columnVisibility.users && (
                        <TableHead className="w-[100px] text-center bg-background">
                          Users
                        </TableHead>
                      )}
                      {columnVisibility.print && (
                        <TableHead className="w-[100px] text-center bg-background">
                          print
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No results found for "{searchQuery}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map(({ party, item, partyIndex, itemIndex }) => {
                        const bgClass = getPartyBgClass(partyIndex);

                        return (
                          <TableRow key={item._internalId} className={bgClass}>
                            {columnVisibility.partyName && (
                              <TableCell className="align-top pr-10">
                                {userRole === "collector" ? (
                                  <div className="text-sm font-medium">{party.id}</div>
                                ) : (
                                  <>
                                    {itemIndex === 0 ? (
                                      <ButtonGroup>
                                        <Button
                                          className="w-auto cursor-pointer hover:bg-red-100"
                                          variant="outline"
                                          onClick={() => {
                                            const updatedParties = parties.filter(
                                              (p) => p.id !== party.id
                                            );
                                            setParties(updatedParties);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-gray-600" />
                                        </Button>
                                        <CreatableCombobox
                                          value={party.party_name}
                                          onValueChange={(value) =>
                                            updatePartyName({
                                              partyId: party.id,
                                              newName: value,
                                            })
                                          }
                                          options={partyNameOptions}
                                          onCreateOption={addPartyNameOption}
                                          placeholder="Select party..."
                                          searchPlaceholder="Search party..."
                                          emptyText="No party found."
                                          type="partyName"
                                        />
                                      </ButtonGroup>
                                    ) : (
                                      <ButtonGroup>
                                        <Button
                                          className="w-auto cursor-pointer hover:bg-red-100"
                                          variant="ghost"
                                          onClick={() => {
                                            handleDeleteItem(party.id, item._internalId);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </ButtonGroup>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.itemId && (
                              <TableCell className="align-top">
                                {userRole === "collector" ? (
                                  <div className="text-sm font-medium">{item.id || "—"}</div>
                                ) : (
                                  <ButtonGroup>
                                    {itemIndex === party.items.length - 1 &&
                                      userRole === "admin" && (
                                        <Button
                                          onClick={() => {
                                            handleAddItem(party.party_name);
                                          }}
                                          className="w-5"
                                          variant="outline"
                                        >
                                          +
                                        </Button>
                                      )}
                                    <CreatableCombobox
                                      value={item.id}
                                      disabled={userRole !== "admin"}
                                      type="itemId"
                                      onValueChange={(value) =>
                                        updateItemField({
                                          partyId: party.id,
                                          internalItemId: item._internalId,
                                          field: "id",
                                          value,
                                        })
                                      }
                                      options={itemIdOptions}
                                      onCreateOption={addItemIdOption}
                                      placeholder="Select ID..."
                                      searchPlaceholder="Search ID..."
                                      emptyText="No ID found."
                                    />
                                  </ButtonGroup>
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.itemName && (
                              <TableCell className="align-top">
                                <CreatableCombobox
                                  value={item.name}
                                  type="itemName"
                                  disabled={userRole !== "admin"}
                                  onValueChange={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "name",
                                      value,
                                    })
                                  }
                                  options={itemNameOptions}
                                  onCreateOption={addItemNameOption}
                                  placeholder="Select item..."
                                  searchPlaceholder="Search item..."
                                  emptyText="No item found."
                                />
                              </TableCell>
                            )}

                            {columnVisibility.description && (
                              <TableCell className="min-w-[200px] align-top">
                                <EditableTextarea
                                  value={item.description}
                                  label="Description"
                                  disabled={userRole !== "admin"}
                                  onSave={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "description",
                                      value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}

                            {columnVisibility.received && (
                              <TableCell className="align-top">
                                {userRole === "collector" ? (
                                  <div className="text-sm font-medium opacity-60">
                                    {item.recived || "—"}
                                  </div>
                                ) : (
                                  <TableNumberInput
                                    value={item.recived}
                                    disabled={userRole !== "admin"}
                                    onBlur={(value) =>
                                      updateItemField({
                                        partyId: party.id,
                                        internalItemId: item._internalId,
                                        field: "recived",
                                        value,
                                      })
                                    }
                                    placeholder="0"
                                  />
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.givenDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.givenClothDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "givenClothDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select given date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.cutting && (
                              <TableCell className="align-top">
                                {userRole === "collector" ? (
                                  <div className="text-sm font-medium opacity-60">
                                    {item.cuttting || "—"}
                                  </div>
                                ) : (
                                  <TableNumberInput
                                    value={item.cuttting}
                                    onBlur={(value) =>
                                      updateItemField({
                                        partyId: party.id,
                                        internalItemId: item._internalId,
                                        field: "cuttting",
                                        value,
                                      })
                                    }
                                    placeholder="0"
                                  />
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.cuttingDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.cuttingDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "cuttingDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select cutting date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.collected && (
                              <TableCell className="align-top">
                                {userRole === "collector" ? (
                                  <div className="text-sm font-medium">
                                    {(() => {
                                      const totalCompleted = (item.user || []).reduce(
                                        (sum: number, userEntry: any) => {
                                          return sum + (userEntry.completed || 0);
                                        },
                                        0
                                      );
                                      return totalCompleted;
                                    })()}
                                  </div>
                                ) : (
                                  <TableNumberInput
                                    value={item.collected}
                                    onBlur={(value) =>
                                      updateItemField({
                                        partyId: party.id,
                                        internalItemId: item._internalId,
                                        field: "collected",
                                        value,
                                      })
                                    }
                                    placeholder="0"
                                  />
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.collectDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.collectDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "collectDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select collect date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.sizes && (
                              <TableCell className="align-top">
                                <SizesList items={item.sizes} />
                                <Dialog>
                                  <DialogTrigger asChild>
                                    {userRole === "cutting" && (
                                      <Button variant="outline" size="sm" className="w-full mt-2">
                                        Edit ({item.sizes.length} sizes)
                                      </Button>
                                    )}
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Manage Sizes (Todo List)</DialogTitle>
                                      <DialogDescription>
                                        Add, check off, or delete sizes. Checked items are marked as
                                        complete.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <SizesTodo
                                      items={item.sizes}
                                      onUpdate={(newSizes) =>
                                        updateItemField({
                                          partyId: party.id,
                                          internalItemId: item._internalId,
                                          field: "sizes",
                                          value: newSizes,
                                        })
                                      }
                                    />
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            )}

                            {columnVisibility.users && (
                              <TableCell className="text-center align-top">
                                {userRole === "collector" ? (
                                  <Sheet>
                                    <SheetTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        {item.user?.length || 0} users
                                      </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-full sm:w-[380px] md:w-[480px]  lg:w-[540px]">
                                      <SheetHeader>
                                        <SheetTitle>Users & Completed Items</SheetTitle>
                                        <SheetDescription>
                                          View users and their completed items (read-only).
                                        </SheetDescription>
                                      </SheetHeader>
                                      <div className="mt-6 space-y-4">
                                        {item.user && item.user.length > 0 ? (
                                          <div className="space-y-3">
                                            {item.user.map((userEntry: any, index: number) => {
                                              const getDisplayName = (user: any) => {
                                                return (
                                                  user?.display_name ||
                                                  user?.name ||
                                                  user?.email ||
                                                  user?.user ||
                                                  "Unknown User"
                                                );
                                              };
                                              const getTotalCount = (entry: any) => {
                                                return (entry.sizes || []).reduce(
                                                  (total: number, s: any) => total + (s.count || 0),
                                                  0
                                                );
                                              };
                                              const totalItems = getTotalCount(userEntry);
                                              const completedItems = userEntry.completed || 0;

                                              return (
                                                <div
                                                  key={index}
                                                  className="border rounded-lg p-4 space-y-2"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-sm">
                                                      {getDisplayName(userEntry.user)}
                                                    </h4>
                                                    <Badge variant="secondary" className="text-xs">
                                                      Menu: {userEntry.menuId || "N/A"}
                                                    </Badge>
                                                  </div>
                                                  <div className="text-sm space-y-1">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-muted-foreground">
                                                        Completed:
                                                      </span>
                                                      <span className="font-medium">
                                                        {completedItems} / {totalItems}
                                                      </span>
                                                    </div>
                                                    {userEntry.sizes && userEntry.sizes.length > 0 && (
                                                      <div className="mt-2">
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                          Sizes:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                          {userEntry.sizes.map(
                                                            (sizeEntry: any, sizeIndex: number) => (
                                                              <Badge
                                                                key={sizeIndex}
                                                                variant="outline"
                                                                className="text-xs"
                                                              >
                                                                {sizeEntry.size} × {sizeEntry.count}
                                                              </Badge>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}
                                                    {userEntry.logs && (
                                                      <p className="text-[10px] text-muted-foreground mt-2">
                                                        {userEntry.logs}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 text-muted-foreground">
                                            <p className="text-sm">No users assigned</p>
                                          </div>
                                        )}
                                      </div>
                                    </SheetContent>
                                  </Sheet>
                                ) : (
                                  <Sheet>
                                    <SheetTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        {item.user?.length || 0} users
                                      </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                      side="right"
                                      className="w-full sm:w-[380px] md:w-[480px] lg:w-[540px] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden"
                                    >
                                      <SheetHeader className="flex-shrink-0">
                                        <SheetTitle>Users & Completed Items</SheetTitle>
                                        <SheetDescription>
                                          View users and their completed items (can edit).
                                        </SheetDescription>
                                      </SheetHeader>
                                      <div className="flex-1 overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 flex flex-col">
                                        <UserManager
                                          users={item.user || []}
                                          sizes={item.sizes.map((s: any) => ({
                                            value: s,
                                            label: s.split(":")[0],
                                          }))}
                                          onUpdate={(newUsers) =>
                                            updateItemField({
                                              partyId: party.id,
                                              internalItemId: item._internalId,
                                              field: "user",
                                              value: newUsers,
                                            })
                                          }
                                        />
                                      </div>
                                    </SheetContent>
                                  </Sheet>
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.print && (
                              <TableCell className="text-center align-top">
                                <ReceiptViewModal data={parties} filter={party.party_name} />
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Card View with Horizontal Scrolling */}
        {parties.length > 0 && (
          <div className="md:hidden">
            <div className="px-6 mb-4">
              <Select
                value={mobilePartyFilter}
                onValueChange={setMobilePartyFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {uniquePartyNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div ref={scrollRef} className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex flex-col gap-4">
                {parties.filter(
                  (p) =>
                    mobilePartyFilter === "all" ||
                    p.party_name === mobilePartyFilter
                ).length === 0 ? (
                  <div className="w-full text-center py-8 text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  parties
                    .filter(
                      (p) =>
                        mobilePartyFilter === "all" ||
                        p.party_name === mobilePartyFilter
                    )
                    .map((data: any, index) => {
                      return (
                        <div key={data.id} className="flex">
                          {data.items.map(
                            (itemData: any, itemIndex: number) => {
                              return (
                                <MobileItemCard
                                  key={itemData._internalId}
                                  party={data}
                                  item={itemData}
                                  partyIndex={index}
                                  itemIndex={itemIndex}
                                />
                              );
                            }
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Mobile Bottom Bar */}
        <div className="flex sm:hidden items-center justify-center h-16 w-full flex-row gap-4 mb-6 sticky bottom-0 bg-background z-20">
          <ButtonGroup>
            <Button onClick={handleSaveData} variant="outline">
              <SaveIcon className="h-5 w-5" />
              Save Data
            </Button>
            <Select
              value={userRole}
              onValueChange={(value: UserRole) => setUserRole(value)}
            >
              <SelectTrigger id="role-select" className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {role.map((r: any) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ButtonGroup>
        </div>
      </div>

      {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {role.includes("admin") && (
          <TabsList className="grid w-[240px] ml-auto grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="access-control">Access Control</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="dashboard" className="space-y-4">
         
        </TabsContent>

        <TabsContent value="access-control" className="space-y-4">
          <AccessControl />
        </TabsContent>
      </Tabs> */}
    </div>
  );
}
