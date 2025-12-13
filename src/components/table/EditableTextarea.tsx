// EditableTextarea component placeholder
"use client";

import { useState, useEffect } from "react";
import { Save as SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditableTextareaProps {
  value: string;
  onSave: (newValue: string) => void;
  label: string;
  disabled?: boolean;
}

export function EditableTextarea({
  value,
  onSave,
  label,
  disabled = false,
}: EditableTextareaProps) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    if (open) {
      setEditValue(value);
    }
  }, [open, value]);

  const handleSave = () => {
    onSave(editValue);
    setOpen(false);
  };

  if (disabled) {
    return <div className="p-2 min-h-[40px] whitespace-pre-wrap">{value}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-accent p-2 rounded transition-colors min-h-[40px] whitespace-pre-wrap">
          {value}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {label}</DialogTitle>
          <DialogDescription>
            Make changes to {label.toLowerCase()} here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-textarea">{label}</Label>
            <Textarea
              id="edit-textarea"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
