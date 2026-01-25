"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, User2, Package, Ruler, Hash, MoreVertical, Edit, AlertCircle, X, Printer } from "lucide-react";
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
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
// import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { allUsersAtom, menuCustomUsersAtom } from "@/store/atoms";
import { useAtom } from "jotai";
import { authService } from "@/service/authService";
import { ButtonGroup } from "../ui/button-group";
// import NumberSpinner from "../Numberfield";
import { SizesList } from "@/components/table/SizesList";

// Size selection with count
interface SizeSelection {
  sizeValue: string;
  count: number;
  completed: number;
}

interface UserEntry {
  user: { id: string; name?: string; email?: string; user?: string };
  menuId: string;
  sizes: { size: string; count: number; completed: number }[];
  completed?: number; // kept for potential backward compatibility, but logically replaced by sizes[].completed
  assigner?: string;
  date?: Date;
  logs?: string; // Last update summary
}

interface UserManagerProps {
  users: UserEntry[];
  sizes: { value: string; label: string }[];
  onUpdate: (newUsers: UserEntry[]) => void;
  itemName: string;
}

export function UserManager({ users, onUpdate, sizes, itemName }: UserManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [allUsers] = useAtom(allUsersAtom);
  const [customUsers, setCustomUsers] = useAtom(menuCustomUsersAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const [openUserAdd, setOpenUserAdd] = useState(false);
  const [, setOpenUserEdit] = useState(false);

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
  // const [completedCount, setCompletedCount] = useState<number>(0);

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

  const buildLogLine = (editor?: { name?: string; email?: string, display_name?: string }): string => {
    const when = formatRelativeDay(new Date());
    const editorName = editor?.display_name || editor?.name || editor?.email || "Unknown";
    return `Last update ${when} by:  ${editorName}`;
  };

  useEffect(() => {
    if (dialogOpen) {
      resetForm();
    }
  }, [dialogOpen]);

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
      setSelectedSizes([...selectedSizes, { sizeValue, count: 1, completed: 0 }]);
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

  const handleCompletedChange = (sizeValue: string, value: string) => {
    const numValue = parseInt(value) || 0;

    setSelectedSizes(selectedSizes.map(s =>
      s.sizeValue === sizeValue ? { ...s, completed: numValue } : s
    ));
    setValidationError(""); // Clear validation on change to let user correct it
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
      if (sizeSelection.completed < 0) {
        setValidationError(`Completed count for size ${parseSizeValue(sizeSelection.sizeValue).size} cannot be negative.`);
        return;
      }
      if (sizeSelection.completed > sizeSelection.count) {
        setValidationError(`Completed count for size ${parseSizeValue(sizeSelection.sizeValue).size} cannot exceed total quantity.`);
        return;
      }
    }

    const totalCompleted = selectedSizes.reduce((sum, s) => sum + s.completed, 0);

    if (isDuplicateUser(selectedUser.id)) {
      setValidationError(`${getDisplayName(selectedUser as any)} has already been added to the list.`);
      return;
    }

    if (isDuplicateMenuId(menuId)) {
      setValidationError(`Menu ID "${menuId.trim()}" already exists. Please use a unique ID.`);
      return;
    }

    const user: any = await authService.getCurrentUser();

    console.log("selectedUser", selectedUser)

    console.log("user", user)

    onUpdate([
      ...users,
      {
        user: selectedUser,
        menuId: menuId.trim(),
        sizes: selectedSizes.map(s => ({
          size: parseSizeValue(s.sizeValue).size,
          count: s.count,
          completed: s.completed
        })),
        completed: totalCompleted, // keeping it for summary if needed, but per-size is source of truth
        assigner: user?.display_name || user?.name || user?.email,
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
    // setCompletedCount(entry.completed ?? 0);

    // Convert entry sizes back to SizeSelection format
    const sizeSelections: SizeSelection[] = entry.sizes.map(s => {
      const matchingSizeOption = sizes.find(option => {
        const { size } = parseSizeValue(option.value);
        return size === s.size;
      });
      return {
        sizeValue: matchingSizeOption?.value || "",
        count: s.count,
        completed: s.completed ?? 0 // fallback for old data
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
      if (sizeSelection.completed < 0) {
        setValidationError(`Completed count for size ${parseSizeValue(sizeSelection.sizeValue).size} cannot be negative.`);
        return;
      }
      if (sizeSelection.completed > sizeSelection.count) {
        setValidationError(`Completed count for size ${parseSizeValue(sizeSelection.sizeValue).size} cannot exceed total quantity.`);
        return;
      }
    }

    const totalCompleted = selectedSizes.reduce((sum, s) => sum + s.completed, 0);

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
        count: s.count,
        completed: s.completed
      })),
      completed: totalCompleted,
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
    // setCompletedCount(0);
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

  const getTotalCompleted = (entry: UserEntry): number => {
    // Prefer summing up individual size completions if available
    const sizeCompletedSum = entry.sizes.reduce((total, s) => total + (s.completed ?? 0), 0);
    return sizeCompletedSum > 0 ? sizeCompletedSum : (entry.completed ?? 0);
  };

  // Update local state immediately for smooth UI
  // const handleCompletedInlineChange = (index: number, value: number) => {
  //   const entry = users[index];
  //   if (!entry) {
  //     return;
  //   }
  //   const total = getTotalCount(entry);
  //   const clamped = Math.max(0, Math.min(total, value));

  //   // Update local state immediately for smooth slider
  //   setLocalCompletedValues(prev => ({
  //     ...prev,
  //     [index]: clamped
  //   }));

  //   // Clear existing timeout for this index
  //   if (debounceTimeoutRef.current[index]) {
  //     clearTimeout(debounceTimeoutRef.current[index]);
  //   }

  //   // Debounce the actual save operation
  //   debounceTimeoutRef.current[index] = setTimeout(async () => {
  //     const user: any = await authService.getCurrentUser();
  //     const updated = [...users];
  //     updated[index] = { ...entry, completed: clamped, logs: buildLogLine(user) };
  //     onUpdate(updated);

  //     // Clear local state after save
  //     setLocalCompletedValues(prev => {
  //       const next = { ...prev };
  //       delete next[index];
  //       return next;
  //     });
  //     delete debounceTimeoutRef.current[index];
  //   }, 300); // 300ms debounce
  // };

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

  const handlePrintCard = (entry: UserEntry) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;



    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${getDisplayName(entry.user)}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 15px; max-width: 320px; margin: 0 auto; color: #000; }
            .header { text-align: center; margin-bottom: 0px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .title { font-weight: bold; font-size: 18px; margin-bottom: 5px; text-transform: uppercase; }
            .subtitle { font-size: 11px; color: #555; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            td { padding: 4px 0; vertical-align: top; font-size: 12px; }
            .label { font-weight: bold; text-align: left; width: 40%; }
            .value { text-align: right; width: 60%; }
            
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            
            .sizes-section { margin-top: 10px; }
            .sizes-title { font-weight: bold; font-size: 12px; margin-bottom: 5px; text-decoration: underline; }
            .size-item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
            
            .footer { text-align: center; font-size: 10px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 5px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">WORK ASSIGNMENT</div>
            <div class="subtitle">AVR Garment System</div>
            <div class="subtitle" style="margin-top:2px">${new Date().toLocaleString()}</div>
          </div>
          
          <table>
            <tr>
              <td class="label">Assigned User:</td>
              <td class="value"><b>${getDisplayName(entry.user)}</b></td>
            </tr>
            <tr>
              <td class="label">Menu ID:</td>
              <td class="value">${entry.menuId}</td>
            </tr>
            <tr>
              <td class="label">Name:</td>
              <td class="value">${itemName}</td>
            </tr>
            <tr>
              <td class="label">Assigner:</td>
              <td class="value">${entry.assigner || "Admin"}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <table>
            <tr>
              <td class="label">Total Quantity:</td>
              <td class="value" style="font-size: 14px; font-weight: bold;">${getTotalCount(entry)}</td>
            </tr>
            <tr>
              <td class="label">Completed:</td>
              <td class="value">${getTotalCompleted(entry)}</td>
            </tr>
          </table>

          <div class="sizes-section">
            <div class="sizes-title">SIZE BREAKDOWN</div>
            <div style="border: 1px solid #000; padding: 5px; border-radius: 4px;">
              ${entry.sizes.map(s => `
                <div class="size-item">
                  <span>Size: <b>${s.size}</b></span>
                  <span>Qty: <b>${s.count}</b> / Done: <b>${s.completed ?? 0}</b></span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="footer">
            Please complete the assigned items.<br/>
            Signature: ________________
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full h-full flex flex-col p-1">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 shrink-0">
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
            <Button size="sm" className="w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[380px] md:w-[480px] lg:w-[540px] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle>Add New Entry</SheetTitle>
              <SheetDescription>
                Fill in all the details and select multiple sizes with quantities.
              </SheetDescription>
            </SheetHeader>

            {validationError && (
              <Alert variant="destructive" className="flex-shrink-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
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
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search users..."
                        className="h-8"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {searchQuery && (
                            <div className="p-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                No user found.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-8"
                                onClick={() => {
                                  const newUser = {
                                    id: `custom-${Date.now()}`,
                                    email: "",
                                    display_name: searchQuery,
                                    roles: ["users"],
                                    created_at: new Date().toISOString(),
                                    email_confirmed: null
                                  };
                                  setCustomUsers([...customUsers, newUser as any]);
                                  setSelectedUser(newUser);
                                  setOpenUserAdd(false);
                                  setValidationError("");
                                  setSearchQuery("");
                                }}
                              >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Create "{searchQuery}"
                              </Button>
                            </div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {[...allUsers, ...customUsers]
                            .filter((user: any) => {
                              if (!searchQuery) return true;
                              const name = getDisplayName(user).toLowerCase();
                              return name.includes(searchQuery.toLowerCase());
                            })
                            .map((user: any) => (
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
                                  <span className="font-medium">{user?.display_name || user?.email}</span>
                                  {user.id.startsWith("custom-") && (
                                    <span className="text-[10px] text-muted-foreground">Local User</span>
                                  )}
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
                        // <Card key={sizeSelection.sizeValue} className="w-[100%] m-2">
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
                              className="h-8 text-sm pr-9"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              / {remaining}
                            </span>
                          </div>

                          <div className="flex-1 relative">
                            <Input
                              type="text"
                              min="0"
                              max={sizeSelection.count}
                              value={sizeSelection.completed}
                              onChange={(e) =>
                                handleCompletedChange(sizeSelection.sizeValue, e.target.value)
                              }
                              placeholder="Done"
                              className="h-8 text-sm pr-9"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              / {sizeSelection.count}
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
                        // </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Global Completed Items Input Removed */}
            </div>

            <SheetFooter className="flex flex-row gap-2 pt-4 flex-shrink-0">
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
        <SheetContent side="right" className="w-full sm:w-[380px] md:w-[480px] lg:w-[540px] p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Edit Entry</SheetTitle>
            <SheetDescription>
              Update the details and sizes for this entry.
            </SheetDescription>
          </SheetHeader>

          {validationError && (
            <Alert variant="destructive" className="flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
            {/* User Combobox */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-user-select" className="flex items-center gap-1.5 text-sm">
                <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                Select User
              </Label>
              <Sheet open={openUserAdd} onOpenChange={setOpenUserAdd}>
                <SheetTrigger asChild>
                  <Button
                    disabled={true}
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
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search users..."
                        className="h-8"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {searchQuery && (
                            <div className="p-2">
                              <p className="text-sm text-muted-foreground mb-2">
                                No user found.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-8"
                                onClick={() => {
                                  const newUser = {
                                    id: `custom-${Date.now()}`,
                                    email: "",
                                    display_name: searchQuery,
                                    roles: ["users"],
                                    created_at: new Date().toISOString(),
                                    email_confirmed: null
                                  };
                                  setCustomUsers([...customUsers, newUser as any]);
                                  setSelectedUser(newUser);
                                  setOpenUserAdd(false);
                                  setValidationError("");
                                  setSearchQuery("");
                                }}
                              >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Create "{searchQuery}"
                              </Button>
                            </div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {[...allUsers, ...customUsers]
                            .filter((user: any) => {
                              if (!searchQuery) return true;
                              const name = getDisplayName(user).toLowerCase();
                              return name.includes(searchQuery.toLowerCase());
                            })
                            .map((user: any) => (
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
                                  <span className="font-medium">{user?.display_name || user?.email}</span>
                                  {user.id.startsWith("custom-") && (
                                    <span className="text-[10px] text-muted-foreground">Local User</span>
                                  )}
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
                <ButtonGroup>
                  <Button variant="outline" className="h-9 text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Input
                    disabled={true}
                    id="edit-menu-id"
                    value={menuId}
                    onChange={(e) => {
                      setMenuId(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="e.g., MENU-001"
                    className="pr-9 h-9 text-sm"
                  />

                  <Button disabled={true} variant="outline" className="h-9 text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>

                </ButtonGroup>
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
                              className="h-8 text-sm pr-9"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              / {remaining}
                            </span>
                          </div>
                          <div className="flex-1 relative">
                            <Input
                              type="text"
                              min="0"
                              max={sizeSelection.count}
                              value={sizeSelection.completed}
                              onChange={(e) =>
                                handleCompletedChange(sizeSelection.sizeValue, e.target.value)
                              }
                              placeholder="Done"
                              className="h-8 text-sm pr-9"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              / {sizeSelection.count}
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

            {/* Global Completed Items Input Removed */}
          </div>

          <SheetFooter className="flex flex-row gap-2 pt-4 flex-shrink-0">
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
      {/* Entries List */}
      {/* Entries List */}
      <div className="w-full flex-1 rounded-md border bg-muted/20 overflow-y-auto min-h-0">
        <div className="p-4 pb-20">
          <div>
            {users.length === 0 ? (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1.5">
                    No entries yet
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Get started by adding your first user entry with the button above
                  </p>
                </CardContent>
              </Card>
            ) : (
              users.map((entry: UserEntry, index: number) => (
                <Card
                  key={index}
                  className="
              group transition-all
              hover:shadow-md
              border-l-4 border-l-primary/0 hover:border-l-primary
              mb-4
            "
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                          <User2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm leading-none mb-1 truncate">
                            {getDisplayName(entry.user)}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge className="h-5 px-1.5 font-normal text-[10px]">
                              {entry.menuId}
                            </Badge>
                          </div>
                        </div>
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
                            onClick={() => handlePrintCard(entry)}
                            className="cursor-pointer"
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
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

                    {/* Progress Section */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {(localCompletedValues[index] ?? entry.completed ?? 0)} /{" "}
                          {getTotalCount(entry)}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((
                            localCompletedValues[index] ?? entry.completed ?? 0
                          ) /
                            Math.max(getTotalCount(entry), 1)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    <Separator />

                    {/* Details Section */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                          <Package className="h-3.5 w-3.5" />
                          Sizes &amp; Quantities
                        </p>
                        <SizesList items={entry.sizes} />
                        <div className="flex justify-end mt-1">
                          <Badge variant="outline" className="text-[10px] h-5">
                            Total: {getTotalCount(entry)} items
                          </Badge>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`all-completed-${index}`}
                            checked={
                              (localCompletedValues[index] ??
                                entry.completed ??
                                0) >= getTotalCount(entry) &&
                              getTotalCount(entry) > 0
                            }
                            onCheckedChange={(checked) =>
                              handleToggleAllCompleted(index, Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor={`all-completed-${index}`}
                            className="text-xs text-muted-foreground cursor-pointer select-none"
                          >
                            Mark all completed
                          </Label>
                        </div>


                      </div>
                      {entry.logs && (
                        <p className="text-[10px] text-muted-foreground italic truncate max-w-auto text-left">
                          {entry.logs}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

    </div >
  );
}
