// DataVisualizationTable component placeholder
"use client";

import * as React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Save as SaveIcon, Search, X as XIcon } from "lucide-react";
// import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
} from "@/store/atoms";
import { roleColumnConfig } from "@/constants";
import { type UserRole } from "@/types";
import { CreatableCombobox } from "./CreatableCombobox";
import { DatePicker } from "./DatePicker";
import { EditableCell } from "./EditableCell";
import { EditableTextarea } from "./EditableTextarea";
import { SizesTodo } from "./SizesTodo";
import { UserManager } from "./UserManager";
import Todo from "@/components/TodoList";


export default function DataVisualizationTable() {
  const [parties] = useAtom(partiesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const filteredData = useAtomValue(filteredPartiesAtom);
  
  const partyNameOptions = useAtomValue(partyNameOptionsAtom);
  const itemNameOptions = useAtomValue(itemNameOptionsAtom);
  const itemIdOptions = useAtomValue(itemIdOptionsAtom);
  
  const updatePartyName = useSetAtom(updatePartyNameAtom);
  const updateItemField = useSetAtom(updateItemFieldAtom);
  const addPartyNameOption = useSetAtom(addPartyNameOptionAtom);
  const addItemNameOption = useSetAtom(addItemNameOptionAtom);
  const addItemIdOption = useSetAtom(addItemIdOptionAtom);

  const columnVisibility = roleColumnConfig[userRole];

  const handleSaveData = () => {
    console.log("=== SAVED DATA ===");
    console.log("Current User Role:", userRole);
    
    const dataToSave = parties.map((party) => ({
      ...party,
      items: party?.items?.map((item) => {
        const { _internalId, ...itemWithoutInternal } = item;
        return itemWithoutInternal;
      }),
    }));
    console.log(JSON.stringify(dataToSave, null, 2));
    console.log("==================");
  };

  const getPartyBgClass = (partyIndex: number) => {
    return partyIndex % 2 === 0 ? "bg-background" : "bg-muted/30";
  };

  return (
    <div className="w-full absolute top-0 left-0 p-6">
      <Todo />
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveData} size="lg" className="gap-2">
              <SaveIcon className="h-5 w-5" />
              Save Data
            </Button>

            <div className="flex items-center gap-2">
              <Label htmlFor="role-select" className="whitespace-nowrap">
                User Role:
              </Label>
              <Select
                value={userRole}
                onValueChange={(value: UserRole) => setUserRole(value)}
              >
                <SelectTrigger id="role-select" className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cutting">Cutting</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.partyName && (
                <TableHead className="w-[180px]">Party Name</TableHead>
              )}
              {columnVisibility.itemId && (
                <TableHead className="w-[150px]">Item ID</TableHead>
              )}
              {columnVisibility.itemName && (
                <TableHead className="w-[150px]">Item Name</TableHead>
              )}
              {columnVisibility.description && (
                <TableHead className="min-w-[200px]">Description</TableHead>
              )}
              {columnVisibility.received && (
                <TableHead className="w-[120px]">Received</TableHead>
              )}
              {columnVisibility.givenDate && (
                <TableHead className="w-[160px]">Given Date</TableHead>
              )}
              {columnVisibility.cutting && (
                <TableHead className="w-[120px]">Cutting</TableHead>
              )}
              {columnVisibility.cuttingDate && (
                <TableHead className="w-[160px]">Cutting Date</TableHead>
              )}
              {columnVisibility.collected && (
                <TableHead className="w-[120px]">Collected</TableHead>
              )}
              {columnVisibility.collectDate && (
                <TableHead className="w-[160px]">Collect Date</TableHead>
              )}
              {columnVisibility.sizes && (
                <TableHead className="min-w-[200px] text-center">
                  Sizes
                </TableHead>
              )}
              {columnVisibility.users && (
                <TableHead className="w-[100px] text-center">Users</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center py-8 text-muted-foreground"
                >
                  No results found for "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((party, partyIndex) =>
                party?.items?.map((item, itemIndex) => {
                  const bgClass = getPartyBgClass(partyIndex);

                  return (
                    <TableRow key={item._internalId} className={bgClass}>
                      {columnVisibility.partyName && (
                        <TableCell className="align-top">
                          {itemIndex === 0 ? (
                            <CreatableCombobox
                              value={party.party_name}
                              onValueChange={(value) =>
                                updatePartyName({ partyId: party.id, newName: value })
                              }
                              options={partyNameOptions}
                              onCreateOption={addPartyNameOption}
                              placeholder="Select party..."
                              searchPlaceholder="Search party..."
                              emptyText="No party found."
                            />
                          ) : null}
                        </TableCell>
                      )}

                      {columnVisibility.itemId && (
                        <TableCell className="align-top">
                          <CreatableCombobox
                            value={item.id}
                            disabled={userRole !== "admin"}
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
                        </TableCell>
                      )}

                      {columnVisibility.itemName && (
                        <TableCell className="align-top">
                          <CreatableCombobox
                            value={item.name}
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
                          <EditableCell
                            value={item.recived}
                            label="Received"
                            onSave={(value) =>
                              updateItemField({
                                partyId: party.id,
                                internalItemId: item._internalId,
                                field: "recived",
                                value,
                              })
                            }
                          />
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
                          <EditableCell
                            value={item.cuttting}
                            label="Cutting"
                            onSave={(value) =>
                              updateItemField({
                                partyId: party.id,
                                internalItemId: item._internalId,
                                field: "cuttting",
                                value,
                              })
                            }
                          />
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
                          <EditableCell
                            value={item.collected}
                            label="Collected"
                            onSave={(value) =>
                              updateItemField({
                                partyId: party.id,
                                internalItemId: item._internalId,
                                field: "collected",
                                value,
                              })
                            }
                          />
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
                        <TableCell className="align-top max-w-[300px]">
                          <div className="flex flex-wrap gap-1.5 p-2">
                            {item.sizes.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                No sizes
                              </span>
                            ) : (
                              item.sizes.map((size, sizeIndex) => (
                                <React.Fragment key={sizeIndex}>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-mono"
                                  >
                                    {size}
                                  </Badge>
                                  {sizeIndex < item.sizes.length - 1 && (
                                    <span className="text-muted-foreground self-center">
                                      /
                                    </span>
                                  )}
                                </React.Fragment>
                              ))
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                              >
                                Edit ({item.sizes.length} sizes)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Manage Sizes (Todo List)
                                </DialogTitle>
                                <DialogDescription>
                                  Add, check off, or delete sizes. Checked items
                                  are marked as complete.
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {item.user.length} users
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Manage Users</DialogTitle>
                                <DialogDescription>
                                  Add or remove users associated with this item.
                                </DialogDescription>
                              </DialogHeader>
                              <UserManager
                               sizes={[]}
                                users={item.user as any}
                                onUpdate={(newUsers) =>
                                  updateItemField({
                                    partyId: party.id,
                                    internalItemId: item._internalId,
                                    field: "user",
                                    value: newUsers,
                                  })
                                }
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
