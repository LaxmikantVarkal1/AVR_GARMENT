// Placeholder for constants
import { type ColumnVisibility, type Party, type DropdownOption } from "@/types/index";

export const roleColumnConfig: Record<string, ColumnVisibility> = {
  admin: {
    partyName: true,
    itemId: true,
    itemName: true,
    description: true,
    received: true,
    givenDate: true,
    cutting: false,
    cuttingDate: false,
    collected: false,
    collectDate: false,
    sizes: false,
    users: false,
    print: true,
  },
  cutting: {
    partyName: false,
    itemId: true,
    itemName: true,
    description: true,
    received: true,
    givenDate: false,
    cutting: true,
    cuttingDate: true,
    collected: false,
    collectDate: false,
    sizes: true,
    users: false,
    print: true,
  },
  distributor: {
    partyName: false,
    itemId: true,
    itemName: true,
    description: true,
    received: false,
    givenDate: false,
    cutting: true,
    cuttingDate: false,
    collected: false,
    collectDate: false,
    sizes: true,
    users: true,
    print: true,
  },
  collector: {
    partyName: false,
    itemId: true, // Item ID
    itemName: true, // Name
    description: false,
    received: true, // Received (disabled)
    givenDate: false,
    cutting: true, // Cutting (disabled)
    cuttingDate: false,
    collected: true, // Collected (total of all users' completed items)
    collectDate: false,
    sizes: false,
    users: true, // Users (view-only)
    print: true,
  },
};

export const initialPartyNameOptions: DropdownOption[] = [
  { value: "ABC Textiles", label: "ABC Textiles" },
  { value: "XYZ Fabrics", label: "XYZ Fabrics" },
  { value: "Premium Cloth House", label: "Premium Cloth House" },
  { value: "Royal Garments", label: "Royal Garments" },
  { value: "Golden Threads", label: "Golden Threads" },
  { value: "Fashion Hub", label: "Fashion Hub" },
  { value: "Silk Palace", label: "Silk Palace" },
];

export const initialItemNameOptions: DropdownOption[] = [
  { value: "panjabi", label: "Panjabi" },
  { value: "kurta", label: "Kurta" },
  { value: "shirt", label: "Shirt" },
  { value: "pant", label: "Pant" },
  { value: "saree", label: "Saree" },
  { value: "dupatta", label: "Dupatta" },
  { value: "sherwani", label: "Sherwani" },
  { value: "blouse", label: "Blouse" },
];

export const initialItemIdOptions: DropdownOption[] = [
  { value: "10001", label: "10001" },
  { value: "10002", label: "10002" },
  { value: "10003", label: "10003" },
  { value: "10004", label: "10004" },
  { value: "10005", label: "10005" },
  { value: "10092", label: "10092" },
  { value: "10093", label: "10093" },
  { value: "10094", label: "10094" },
  { value: "10095", label: "10095" },
];

export const sizeOptions: DropdownOption[] = [

];

export const initialData: Party[] = [
  {
    id: 1,
    party_name: "ABC Textiles",
    items: [
      {
        _internalId: "item-1-1",
        id: "10001",
        name: "panjabi",
        description: "this is a good panjabi",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-10-01"),
        cuttingDate: new Date("2025-10-05"),
        collectDate: new Date("2025-10-10"),
      },
      {
        _internalId: "item-1-2",
        id: "10092",
        name: "kurta",
        description: "this is a good kurta",
        recived: "8070m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-10-02"),
        cuttingDate: new Date("2025-10-06"),
        collectDate: new Date("2025-10-12"),
      },
    ],
  },
  {
    id: 2,
    party_name: "XYZ Fabrics",
    items: [
      {
        _internalId: "item-2-1",
        id: "10002",
        name: "shirt",
        description: "this is a good shirt",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-09-25"),
        cuttingDate: new Date("2025-09-30"),
        collectDate: new Date("2025-10-08"),
      },
      {
        _internalId: "item-2-2",
        id: "10003",
        name: "pant",
        description: "this is a good pant",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-09-28"),
        cuttingDate: new Date("2025-10-03"),
        collectDate: new Date("2025-10-09"),
      },
    ],
  },
];
