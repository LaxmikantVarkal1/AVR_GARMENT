// Placeholder for Recoil or Jotai atoms (or other state management)
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type UserProfile } from "@/types/auth.types";

import {
  type Party,
  type UserRole,
  type DropdownOption,
  type item,
} from "@/types";
import {
  initialPartyNameOptions,
  initialItemNameOptions,
  initialItemIdOptions,
} from "@/constants";

// Core data atoms
export const partiesAtom = atom<Party[]>([]);
export const searchQueryAtom = atom<string>("");
export const userRoleAtom = atom<UserRole>("admin");
export const activeRoute = atom<string>("admin/dashboard");
export const isLogin = atom<boolean>(true);
export const authenticated = atom<boolean>(false);
export const allowedRoles = atom<string[]>([]);
export const employee = atom<string>("");

// Dropdown options atoms
export const partyNameOptionsAtom = atomWithStorage<DropdownOption[]>(
  "party_names", initialPartyNameOptions
);
export const itemNameOptionsAtom = atomWithStorage<DropdownOption[]>(
  "item_names", initialItemNameOptions
);
export const itemIdOptionsAtom = atomWithStorage<DropdownOption[]>("item_id", initialItemIdOptions);

// Derived atoms
export const filteredPartiesAtom = atom((get) => {
  const parties = get(partiesAtom);
  const query = get(searchQueryAtom).toLowerCase().trim();

  if (!query) return parties;

  return parties
    .map((party) => ({
      ...party,
      items: party.items.filter(
        (item) =>
          party.party_name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.recived.toLowerCase().includes(query) ||
          item.cuttting.toLowerCase().includes(query) ||
          item.collected.toLowerCase().includes(query) ||
          item.sizes.some((size) => size.toLowerCase().includes(query)) ||
          item.user.some(
            (user) =>
              user.name.toLowerCase().includes(query) ||
              user.id.toLowerCase().includes(query)
          )
      ),
    }))
    .filter((party) => party.items.length > 0);
});

// Actions atoms
export const updatePartyNameAtom = atom(
  null,
  (get, set, { partyId, newName }: { partyId: number; newName: string }) => {
    const parties = get(partiesAtom);
    set(
      partiesAtom,
      parties.map((party) =>
        party.id === partyId ? { ...party, party_name: newName } : party
      )
    );
  }
);

export const updateItemFieldAtom = atom(
  null,
  (
    get,
    set,
    {
      partyId,
      internalItemId,
      field,
      value,
    }: {
      partyId: number;
      internalItemId: string;
      field: keyof item;
      value: any;
    }
  ) => {
    const parties = get(partiesAtom);
    set(
      partiesAtom,
      parties.map((party) =>
        party.id === partyId
          ? {
            ...party,
            items: party?.items?.map((item) =>
              item._internalId === internalItemId
                ? { ...item, [field]: value }
                : item
            ),
          }
          : party
      )
    );
  }
);

export const addPartyNameOptionAtom = atom(
  null,
  (get, set, value: string) => {
    const options = get(partyNameOptionsAtom);
    if (!options.find((opt) => opt.value === value)) {
      set(partyNameOptionsAtom, [...options, { value, label: value }]);
    }
  }
);

export const removePartyNameOptionAtom = atom(
  null,
  (get, set, value: string) => {
    const options = get(partyNameOptionsAtom);
    set(
      partyNameOptionsAtom,
      options.filter((opt) => opt.value !== value)
    );
  }
);

export const addItemNameOptionAtom = atom(
  null,
  (get, set, value: string) => {
    const options = get(itemNameOptionsAtom);
    if (!options.find((opt) => opt.value === value)) {
      set(itemNameOptionsAtom, [...options, { value, label: value }]);
    }
  }
);

export const removeItemNameOptionAtom = atom(
  null,
  (get, set, value: string) => {
    const options = get(itemNameOptionsAtom);
    set(
      itemNameOptionsAtom,
      options.filter((opt) => opt.value !== value)
    );
  }
);

export const addItemIdOptionAtom = atom(null, (get, set, value: string) => {
  const options = get(itemIdOptionsAtom);
  if (!options.find((opt) => opt.value === value)) {
    set(itemIdOptionsAtom, [...options, { value, label: value }]);
  }
});

export const removeItemIdOptionAtom = atom(
  null,
  (get, set, value: string) => {
    const options = get(itemIdOptionsAtom);
    set(
      itemIdOptionsAtom,
      options.filter((opt) => opt.value !== value)
    );
  }
);







// Store authenticated user data (persisted in localStorage)
export const userAtom = atom<UserProfile | null>(null)

export const setUserAtom = atom(
  null,
  (_, set, user: any | null) => {
    set(userAtom, user)
  }
)
export const allUsersAtom = atom<UserProfile[]>([]);



// Auth loading state
export const authLoadingAtom = atom(false)

// Auth error message
export const authErrorAtom = atom<string | null>(null)

// Derived atom to check if user is authenticated
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
)

// Derived atom to get user roles
export const userRolesAtom = atom(
  (get) => get(userAtom)?.roles || []
)

// Derived atom to check if user has specific role
export const hasRoleAtom = (role: string) => atom(
  (get) => {
    const roles = get(userRolesAtom)
    return roles.includes(role as any)
  }
)

// Derived atom to check if user is admin
export const isAdminAtom = atom(
  (get) => {
    const roles = get(userRolesAtom)
    return roles.includes('admin')
  }
)

export const isUserLoggedInAtom = atom(
  (get) => get(userAtom) !== null
)


// Local storage for custom users added in the menu
export const menuCustomUsersAtom = atomWithStorage<UserProfile[]>(
  "menu_custom_users",
  []
);
