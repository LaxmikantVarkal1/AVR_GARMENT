import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase";
import { atom } from "jotai";
import type { Party } from "@/types";
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fetch data atom
export const fetchPartiesAtom = atom(async () => {
  const { data, error } = await supabase
    .from("party_data")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }
  // ✅ Normalize "items" key casing
  const normalized = (data || []).map((party) => ({
    ...party,
    items: party.items || party.items || [],
  }));
  return normalized || [];
});
export const formatDate = (date?: Date | string) => {
  if (!date) return "N/A";
  // Handle ISO strings or Date objects
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const savePartiesAtom = atom(null, async (_get, _set, id: number, parties: Party[]) => {
  // const { error } = await supabase
  // .from("party_data")
  // .upsert([{ id, data: parties,updated_at:new Date() }], { onConflict: "id" }) // insert entire array as JSON

  // if (error) {
  //   toast.error("Error saving parties");
  // } else {
  //   toast.success("Parties saved successfully");
  // }


  toast.promise(
    async () => {
      const { error } = await supabase
        .from("party_data")
        .upsert(
          [{
            id,
            data: parties,
            updated_at: new Date()
          }],
          { onConflict: "id" }
        );

      if (error) throw error;
      return { name: "Parties" };
    },
    {
      loading: "Saving parties...",
      success: (data) => `${data.name} has been saved successfully!`,
      error: "Failed to save parties",
    }
  );

});

