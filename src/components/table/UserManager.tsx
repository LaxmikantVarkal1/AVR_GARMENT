"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, User2, Package, Ruler, Hash, MoreVertical, Edit, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { allUsersAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { authService } from "@/service/authService";

// Size selection with count
interface SizeSelection {
  sizeValue: string;
  count: number;
}

interface UserEntry {
  user: { id: string; name?: string; email?: string; user?: string };
  menuId: string;
  sizes: { size: string; count: number }[];
  completed?: number;
  assigner?: string;
  date?: Date;
  logs?: string; // Last update summary
}

interface UserManagerProps {
  users: UserEntry[];
  sizes: { value: string; label: string }[];
  onUpdate: (newUsers: UserEntry[]) => void;
}

export function UserManager({ users, onUpdate, sizes }: UserManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [allUsers] = useAtom(allUsersAtom);
  
  const [openUserAdd, setOpenUserAdd] = useState(false);
  const [,setOpenUserEdit] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name?: string;
    email?: string;
    display_name?: string;
  } | null>(null);
  const [menuId, setMenuId] = useState("");
  
  const [selectedSizes, setSelectedSizes] = useState<SizeSelection[]>([]);
  
  const [validationError, setValidationError] = useState<string>("");
  const [completedCount, setCompletedCount] = useState<number>(0);
  
  // Optimistic state for smooth slider interaction
  const [localCompletedValues, setLocalCompletedValues] = useState<{ [key: number]: number }>({});
  const debounceTimeoutRef = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

  const formatRelativeDay = (date: Date): string => {
    const now = new Date();
    const isSameDay =
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate();
    if (isSameDay) {
      return "today";
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      tomorrow.getFullYear() === date.getFullYear() &&
      tomorrow.getMonth() === date.getMonth() &&
      tomorrow.getDate() === date.getDate();
    if (isTomorrow) {
      return "tomorrow";
    }
    return date.toLocaleDateString();
  };

  const buildLogLine = (editor?: { name?: string; email?: string }): string => {
    const when = formatRelativeDay(new Date());
    const editorName = editor?.name || editor?.email || "Unknown";
    return `Last update ${when} ${editorName}`;
  };

  // Helper function to get display name
  const getDisplayName = (user: { name?: string; email?: string; display_name?: string }): string => {
    return user.display_name || user?.name?.split("@")[0] || user?.email?.split("@")[0] || "Unknown User";
  };

  // Helper function to parse size value
  const parseSizeValue = (value: string): { size: string; maxCount: number } => {
    const parts = value.split(":");
    return {
      size: parts[0] || "",
      maxCount: parseInt(parts[1]) || 0,
    };
  };

  // Calculate used count for a specific size (excluding a specific index for edit mode)
  const getUsedCountForSize = (sizeValue: string, excludeIndex?: number): number => {
    const { size } = parseSizeValue(sizeValue);
    return users.reduce((total: number, entry: UserEntry, index: number) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return total;
      }
      const sizeEntry = entry.sizes.find(s => s.size === size);
      return total + (sizeEntry?.count || 0);
    }, 0);
  };

  // Get remaining count for a specific size
  const getRemainingCountForSize = (sizeValue: string): number => {
    const { maxCount } = parseSizeValue(sizeValue);
    const usedCount = getUsedCountForSize(sizeValue, editIndex !== null ? editIndex : undefined);
    return maxCount - usedCount;
  };

  // Check if size is already selected
  const isSizeSelected = (sizeValue: string): boolean => {
    return selectedSizes.some(s => s.sizeValue === sizeValue);
  };

  // Handle size checkbox change
  const handleSizeToggle = (sizeValue: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes([...selectedSizes, { sizeValue, count: 1 }]);
    } else {
      setSelectedSizes(selectedSizes.filter(s => s.sizeValue !== sizeValue));
    }
    setValidationError("");
  };

  // Handle count change for a specific size
  const handleCountChange = (sizeValue: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const remaining = getRemainingCountForSize(sizeValue);
    
    setSelectedSizes(selectedSizes.map(s => 
      s.sizeValue === sizeValue ? { ...s, count: numValue } : s
    ));

    // Validate count
    if (numValue > remaining) {
      setValidationError(`Size ${parseSizeValue(sizeValue).size} has only ${remaining} items available.`);
    } else if (numValue < 1) {
      setValidationError("Count must be at least 1 for all selected sizes.");
    } else {
      setValidationError("");
    }
  };

  // Remove a selected size
  const handleRemoveSize = (sizeValue: string) => {
    setSelectedSizes(selectedSizes.filter(s => s.sizeValue !== sizeValue));
    setValidationError("");
  };

  // Check for duplicate user
  const isDuplicateUser = (userId: string, excludeIndex?: number) => {
    return users.some((entry: UserEntry, index: number) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return entry.user.id === userId;
    });
  };

  // Check for duplicate menu ID
  const isDuplicateMenuId = (menuIdValue: string, excludeIndex?: number) => {
    return users.some((entry: UserEntry, index: number) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return entry.menuId.toLowerCase() === menuIdValue.toLowerCase().trim();
    });
  };

  const handleAdd = async () => {
    setValidationError("");

    if (!selectedUser || !menuId.trim() || selectedSizes.length === 0) {
      setValidationError("Please fill all required fields and select at least one size.");
      return;
    }

    // Validate all counts
    for (const sizeSelection of selectedSizes) {
      const remaining = getRemainingCountForSize(sizeSelection.sizeValue);
      if (sizeSelection.count > remaining) {
        const { size } = parseSizeValue(sizeSelection.sizeValue);
        setValidationError(`Size ${size} has only ${remaining} items available.`);
        return;
      }
      if (sizeSelection.count < 1) {
        setValidationError("All counts must be at least 1.");
        return;
      }
    }

    const totalSelected = selectedSizes.reduce((sum, s) => sum + s.count, 0);
    if (completedCount < 0) {
      setValidationError("Completed items cannot be negative.");
      return;
    }
    if (completedCount > totalSelected) {
      setValidationError(`Completed items cannot exceed total (${totalSelected}).`);
      return;
    }

    if (isDuplicateUser(selectedUser.id)) {
      setValidationError(`${getDisplayName(selectedUser as any)} has already been added to the list.`);
      return;
    }

    if (isDuplicateMenuId(menuId)) {
      setValidationError(`Menu ID "${menuId.trim()}" already exists. Please use a unique ID.`);
      return;
    }

    const user: any = await authService.getCurrentUser();

    console.log("selectedUser",selectedUser)
    
    onUpdate([
      ...users,
      {
        user: selectedUser,
        menuId: menuId.trim(),
        sizes: selectedSizes.map(s => ({
          size: parseSizeValue(s.sizeValue).size,
          count: s.count
        })),
        completed: completedCount,
        assigner: user?.name || user?.email,
        date: new Date(),
        logs: buildLogLine(user)
      },
    ]);
    
    resetForm();
    setDialogOpen(false);
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setValidationError("");
    const entry = users[index];
    setSelectedUser(entry.user);
    setMenuId(entry.menuId);
    setCompletedCount(entry.completed ?? 0);
    
    // Convert entry sizes back to SizeSelection format
    const sizeSelections: SizeSelection[] = entry.sizes.map(s => {
      const matchingSizeOption = sizes.find(option => {
        const { size } = parseSizeValue(option.value);
        return size === s.size;
      });
      return {
        sizeValue: matchingSizeOption?.value || "",
        count: s.count
      };
    }).filter(s => s.sizeValue !== "");
    
    setSelectedSizes(sizeSelections);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    setValidationError("");

    if (editIndex === null || !selectedUser || !menuId.trim() || selectedSizes.length === 0) {
      setValidationError("Please fill all required fields and select at least one size.");
      return;
    }

    // Validate all counts
    for (const sizeSelection of selectedSizes) {
      const remaining = getRemainingCountForSize(sizeSelection.sizeValue);
      if (sizeSelection.count > remaining) {
        const { size } = parseSizeValue(sizeSelection.sizeValue);
        setValidationError(`Size ${size} has only ${remaining} items available.`);
        return;
      }
      if (sizeSelection.count < 1) {
        setValidationError("All counts must be at least 1.");
        return;
      }
    }

    const totalSelected = selectedSizes.reduce((sum, s) => sum + s.count, 0);
    if (completedCount < 0) {
      setValidationError("Completed items cannot be negative.");
      return;
    }
    if (completedCount > totalSelected) {
      setValidationError(`Completed items cannot exceed total (${totalSelected}).`);
      return;
    }

    if (isDuplicateUser(selectedUser.id, editIndex)) {
      setValidationError(`${getDisplayName(selectedUser as any)} has already been added to the list.`);
      return;
    }

    if (isDuplicateMenuId(menuId, editIndex)) {
      setValidationError(`Menu ID "${menuId.trim()}" already exists. Please use a unique ID.`);
      return;
    }

    const user: any = await authService.getCurrentUser();
    const updatedUsers = [...users];
    updatedUsers[editIndex] = {
      ...updatedUsers[editIndex],
      user: selectedUser,
      menuId: menuId.trim(),
      sizes: selectedSizes.map(s => ({
        size: parseSizeValue(s.sizeValue).size,
        count: s.count
      })),
      completed: completedCount,
      logs: buildLogLine(user)
    };
    onUpdate(updatedUsers);
    
    resetForm();
    setEditIndex(null);
    setEditDialogOpen(false);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      onUpdate(users.filter((_: any, i: number) => i !== deleteIndex));
      setDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setMenuId("");
    setSelectedSizes([]);
    setValidationError("");
    setOpenUserAdd(false);
    setOpenUserEdit(false);
    setCompletedCount(0);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
      setEditIndex(null);
    }
    setEditDialogOpen(open);
  };

  const isFormValid =
    selectedUser && 
    menuId.trim() && 
    selectedSizes.length > 0 && 
    selectedSizes.every(s => s.count > 0) && 
    !validationError;

  // Get total item count for an entry
  const getTotalCount = (entry: UserEntry): number => {
    return entry.sizes.reduce((total, s) => total + s.count, 0);
  };

  // Update local state immediately for smooth UI
  const handleCompletedInlineChange = (index: number, value: number) => {
    const entry = users[index];
    if (!entry) {
      return;
    }
    const total = getTotalCount(entry);
    const clamped = Math.max(0, Math.min(total, value));
    
    // Update local state immediately for smooth slider
    setLocalCompletedValues(prev => ({
      ...prev,
      [index]: clamped
    }));

    // Clear existing timeout for this index
    if (debounceTimeoutRef.current[index]) {
      clearTimeout(debounceTimeoutRef.current[index]);
    }

    // Debounce the actual save operation
    debounceTimeoutRef.current[index] = setTimeout(async () => {
      const user: any = await authService.getCurrentUser();
      const updated = [...users];
      updated[index] = { ...entry, completed: clamped, logs: buildLogLine(user) };
      onUpdate(updated);
      
      // Clear local state after save
      setLocalCompletedValues(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      delete debounceTimeoutRef.current[index];
    }, 300); // 300ms debounce
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleToggleAllCompleted = async (index: number, checked: boolean) => {
    const entry = users[index];
    if (!entry) {
      return;
    }
    const total = getTotalCount(entry);
    const newValue = checked ? total : 0;
    
    // Update local state immediately
    setLocalCompletedValues(prev => ({
      ...prev,
      [index]: newValue
    }));

    // Clear any pending debounce for this index
    if (debounceTimeoutRef.current[index]) {
      clearTimeout(debounceTimeoutRef.current[index]);
    }

    // Save immediately (no debounce needed for checkbox click)
    const user: any = await authService.getCurrentUser();
    const updated = [...users];
    updated[index] = { ...entry, completed: newValue, logs: buildLogLine(user) };
    onUpdate(updated);
    
    // Clear local state after save
    setLocalCompletedValues(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  return (
    <div className="w-full m-2 mt-5 overflow-scroll">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            User Entries
            {users.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {users.length}
              </Badge>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage user entries with multiple sizes
          </p>
        </div>

        {/* Add Entry Sheet */}
        <Sheet open={dialogOpen} onOpenChange={handleDialogClose}>
          <SheetTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[380px] md:w-[480px]  lg:w-[540px] flex flex-col">
            <SheetHeader>
              <SheetTitle>Add New Entry</SheetTitle>
              <SheetDescription>
                Fill in all the details and select multiple sizes with quantities.
              </SheetDescription>
            </SheetHeader>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 p-4 flex-1 overflow-y-auto">
              {/* User Combobox */}
              <div className="space-y-1.5">
                <Label htmlFor="user-select" className="flex items-center gap-1.5 text-sm">
                  <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Select User
                </Label>
                <Sheet open={openUserAdd} onOpenChange={setOpenUserAdd}>
                  <SheetTrigger asChild>
                    <Button
                      id="user-select"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openUserAdd}
                      className={cn(
                        "w-full justify-between h-9 text-sm",
                        !selectedUser && "text-muted-foreground"
                      )}
                    >
                      {selectedUser ? getDisplayName(selectedUser as any) : "Choose a user..."}
                      <User2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[--radix-popover-trigger-width] p-0">
                    <SheetHeader>
                      <SheetTitle>Select User</SheetTitle>
                      <SheetDescription>
                        Search and select a user to assign.
                      </SheetDescription>
                    </SheetHeader>
                    <Command>
                      <CommandInput placeholder="Search users..." className="h-8" />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers.map((user: any) => (
                            <CommandItem
                              key={user.id}
                              value={getDisplayName(user)}
                              onSelect={() => {
                                setSelectedUser(user);
                                setOpenUserAdd(false);
                                setValidationError("");
                              }}
                              className="cursor-pointer text-sm"
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selectedUser?.id === user.id
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{user?.display_name|| user?.email}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email || user.id}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Menu ID Input */}
              <div className="space-y-1.5">
                <Label htmlFor="menu-id" className="flex items-center gap-1.5 text-sm">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Menu ID
                </Label>
                <div className="relative">
                  <Input
                    id="menu-id"
                    value={menuId}
                    onChange={(e) => {
                      setMenuId(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="e.g., MENU-001"
                    className="pr-9 h-9 text-sm"
                  />
                  <Hash className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Size Selection with Checkboxes */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                  Select Sizes
                  {selectedSizes.length > 0 && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {selectedSizes.length} selected
                    </Badge>
                  )}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => {
                    const { size: sizeLabel, maxCount } = parseSizeValue(size.value);
                    const usedCount = getUsedCountForSize(size.value);
                    const remaining = maxCount - usedCount;
                    const isSelected = isSizeSelected(size.value);
                    
                    return (
                      <div
                        key={size.value}
                        className={cn(
                          "flex items-center space-x-2 rounded-md border p-2.5 transition-colors",
                          isSelected && "border-primary bg-accent",
                          remaining <= 0 && !isSelected && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Checkbox
                          id={`size-${size.value}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSizeToggle(size.value, checked as boolean)
                          }
                          disabled={remaining <= 0 && !isSelected}
                        />
                        <Label
                          htmlFor={`size-${size.value}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div className="flex flex-col">
                            <span>{sizeLabel}</span>
                            <span className={cn(
                              "text-xs",
                              remaining <= 0 ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {remaining > 0 ? `${remaining} available` : "Out of stock"}
                            </span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Sizes with Count Inputs */}
              {selectedSizes.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    Item Counts
                  </Label>
                  <div className="space-y-2">
                    {selectedSizes.map((sizeSelection) => {
                      const { size: sizeLabel } = parseSizeValue(sizeSelection.sizeValue);
                      const remaining = getRemainingCountForSize(sizeSelection.sizeValue);
                      
                      return (
                        <Card key={sizeSelection.sizeValue} className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0">
                              {sizeLabel}
                            </Badge>
                            <div className="flex-1 relative">
                              <Input
                                type="text"
                                min="1"
                                max={remaining}
                                value={sizeSelection.count}
                                onChange={(e) => 
                                  handleCountChange(sizeSelection.sizeValue, e.target.value)
                                }
                                placeholder="Qty"
                                className="h-8 text-sm pr-20"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                / {remaining}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => handleRemoveSize(sizeSelection.sizeValue)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Completed Items Input */}
              {selectedSizes.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    Completed Items
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={selectedSizes.reduce((sum, s) => sum + s.count, 0)}
                      value={completedCount}
                      onChange={(e) => setCompletedCount(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="h-9 text-sm pr-24"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      / {selectedSizes.reduce((sum, s) => sum + s.count, 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="flex flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!isFormValid} size="sm" className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Sheet - Same structure as Add Sheet */}
      <Sheet open={editDialogOpen} onOpenChange={handleEditDialogClose}>
        <SheetContent side="right" className="w-full sm:w-[380px] md:w-[480px]  lg:w-[540px] flex flex-col p-2.5">
          <SheetHeader>
            <SheetTitle>Edit Entry</SheetTitle>
            <SheetDescription>
              Update the details and sizes for this entry.
            </SheetDescription>
          </SheetHeader>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            {/* User Combobox */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-user-select" className="flex items-center gap-1.5 text-sm">
                <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                Select User
              </Label>
              <Sheet open={openUserAdd} onOpenChange={setOpenUserAdd}>
  <SheetTrigger asChild>
    <Button
      id="user-select"
      variant="outline"
      role="combobox"
      aria-expanded={openUserAdd}
      className={cn(
        "w-full justify-between h-9 text-sm",
        !selectedUser && "text-muted-foreground"
      )}
    >
      {selectedUser ? getDisplayName(selectedUser as any) : "Choose a user..."}
      <User2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="max-w-xs w-full flex flex-col">
    <SheetHeader>
      <SheetTitle>Select User</SheetTitle>
      <SheetDescription>
        Search and select a user to assign.
      </SheetDescription>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto py-2">
      <Command>
        <CommandInput placeholder="Search users..." className="h-8" />
        <CommandList>
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            {allUsers.map((user: any) => (
              <CommandItem
                key={user.id}
                value={getDisplayName(user)}
                onSelect={() => {
                  setSelectedUser(user);
                  setOpenUserAdd(false);
                  setValidationError("");
                }}
                className="cursor-pointer text-sm"
              >
                <div
                  className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selectedUser?.id === user.id
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{getDisplayName(user)}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email || user.id}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  </SheetContent>
</Sheet>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-menu-id" className="flex items-center gap-1.5 text-sm">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Menu ID
              </Label>
              <div className="relative">
                <Input
                  id="edit-menu-id"
                  value={menuId}
                  onChange={(e) => {
                    setMenuId(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="e.g., MENU-001"
                  className="pr-9 h-9 text-sm"
                />
                <Hash className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Size Selection with Checkboxes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                Select Sizes
                {selectedSizes.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {selectedSizes.length} selected
                  </Badge>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => {
                  const { size: sizeLabel, maxCount } = parseSizeValue(size.value);
                  const usedCount = getUsedCountForSize(size.value, editIndex !== null ? editIndex : undefined);
                  const remaining = maxCount - usedCount;
                  const isSelected = isSizeSelected(size.value);
                  
                  return (
                    <div
                      key={size.value}
                      className={cn(
                        "flex items-center space-x-2 rounded-md border p-2.5 transition-colors",
                        isSelected && "border-primary bg-accent"
                      )}
                    >
                      <Checkbox
                        id={`edit-size-${size.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleSizeToggle(size.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`edit-size-${size.value}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div className="flex flex-col">
                          <span>{sizeLabel}</span>
                          <span className="text-xs text-muted-foreground">
                            {remaining} available
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Sizes with Count Inputs */}
            {selectedSizes.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Item Counts
                </Label>
                <div className="space-y-2">
                  {selectedSizes.map((sizeSelection) => {
                    const { size: sizeLabel } = parseSizeValue(sizeSelection.sizeValue);
                    const remaining = getRemainingCountForSize(sizeSelection.sizeValue);
                    
                    return (
                      <Card key={sizeSelection.sizeValue} className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="shrink-0">
                            {sizeLabel}
                          </Badge>
                          <div className="flex-1 relative">
                            <Input
                              type="number"
                              min="1"
                              max={remaining}
                              value={sizeSelection.count}
                              onChange={(e) => 
                                handleCountChange(sizeSelection.sizeValue, e.target.value)
                              }
                              placeholder="Qty"
                              className="h-8 text-sm pr-20"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              / {remaining}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleRemoveSize(sizeSelection.sizeValue)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Completed Items Input */}
            {selectedSizes.length > 0 && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Completed Items
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={selectedSizes.reduce((sum, s) => sum + s.count, 0)}
                    value={completedCount}
                    onChange={(e) => setCompletedCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="h-9 text-sm pr-24"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    / {selectedSizes.reduce((sum, s) => sum + s.count, 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="flex flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!isFormValid} size="sm" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              entry
              {deleteIndex !== null && users[deleteIndex] && (
                <span className="font-medium">
                  {" "}
                  for {getDisplayName(users[deleteIndex].user)}
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setDeleteIndex(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Entries List */}
      <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md">
        <div className="space-y-2 pr-4 w-[calc(100wv-40px)]">
          {users.length === 0 ? (
            <Card className="w-[300px]">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm mb-1.5">No entries yet</h4>
                <p className="text-xs text-muted-foreground text-center max-w-xs px-4">
                  Get started by adding your first user entry with the button
                  above
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((entry: UserEntry, index: number) => (
              <Card
                key={index}
                className="group hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <User2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm leading-none mb-0.5 truncate">
                            {getDisplayName(entry.user)}
                          </h4>
                          {/* <p className="text-xs text-muted-foreground truncate">
                            {entry.user.email || entry.user.id}
                          </p> */}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(index)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(index)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Separator className="my-1.5" />
                      <div className="space-y-2 w-[220px]">
                        <div className="flex items-center gap-2 text-xs">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Menu:</span>
                          <span className="font-medium">{entry.menuId}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Sizes & Quantities:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {entry.sizes.map((sizeEntry, sizeIndex) => (
                              <Badge 
                                key={sizeIndex} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {sizeEntry.size} × {sizeEntry.count}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="text-xs">
                              Total: {getTotalCount(entry)}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium">
                              {localCompletedValues[index] !== undefined ? localCompletedValues[index] : entry.completed ?? 0} / {getTotalCount(entry)}
                            </span>
                          </div>
                          {/* <div className="w-full px-1">
                            <Slider
                              value={[localCompletedValues[index] !== undefined ? localCompletedValues[index] : entry.completed ?? 0]}
                              onValueChange={(values) => handleCompletedInlineChange(index, values[0])}
                              min={0}
                              max={getTotalCount(entry)}
                              step={1}
                              className="w-full"
                              aria-label="Completed items"
                            />
                          </div> */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`all-completed-${index}`}
                              checked={(localCompletedValues[index] !== undefined ? localCompletedValues[index] : entry.completed ?? 0) >= getTotalCount(entry) && getTotalCount(entry) > 0}
                              onCheckedChange={(checked) => handleToggleAllCompleted(index, Boolean(checked))}
                            />
                            <Label
                              htmlFor={`all-completed-${index}`}
                              className="text-xs text-muted-foreground cursor-pointer"
                            >
                              Mark all completed
                            </Label>
                          </div>
                          {entry.logs && (
                            <p className="text-[10px] text-muted-foreground">{entry.logs}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
