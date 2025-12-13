"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { X, Printer } from "lucide-react";
import { useAtom } from "jotai";
import { userRoleAtom } from "@/store/atoms";
import { roleColumnConfig } from "@/constants";
import { SizesList } from "@/components/table/SizesList";

interface SavePageProps {
  data: any[];
  filter: any;
}

export default function SavePage({ data, filter }: SavePageProps) {
  const [open, setOpen] = useState(false);
  const [userRole] = useAtom(userRoleAtom);

  const selectedItems =
    filter === "all"
      ? data
      : data.filter((party: any) => party.party_name === filter);

  const allItems = selectedItems.flatMap((party: any) =>
    party.items.map((item: any) => ({ party, item }))
  );

  const cardsPerPage = 9;
  const totalPages = Math.ceil(allItems.length / cardsPerPage);

  /** 🔹 Adjust print paper size dynamically */
  const adjustPrintSize = () => {
    const totalCards = allItems.length;
    document.body.classList.remove("small-print", "tiny-print");

    if (totalCards <= 2) {
      document.body.classList.add("tiny-print"); // A6
    } else if (totalCards <= 5) {
      document.body.classList.add("small-print"); // A5
    }
  };

  const handlePrint = () => {
    adjustPrintSize();
    window.print();
  };

  // const handlePrintPage = (pageNumber: number) => {
  //   adjustPrintSize();
  //   const allPages = document.querySelectorAll(".page-container");
  //   allPages.forEach((page, index) => {
  //     if (index !== pageNumber - 1) {
  //       page.classList.add("temp-hide-page");
  //     }
  //   });

  //   window.print();

  //   setTimeout(() => {
  //     allPages.forEach((page) => {
  //       page.classList.remove("temp-hide-page");
  //     });
  //   }, 100);
  // };

  /** 🔹 Helper for a single info row */
  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="border-b border-dotted border-gray-400 pb-0.5">
      <div className="flex justify-between gap-1">
        <span className="font-bold uppercase text-[9px] text-gray-600">
          {label}
        </span>
        <span className="font-bold text-right truncate">{value || "-"}</span>
      </div>
    </div>
  );

  /** 🔹 Render one card */
  type Role = keyof typeof roleColumnConfig;
  const renderCard = (party: any, item: any, keyPrefix: string, role: Role) => {
    const visible = roleColumnConfig[role];
    const hasUsers =
      visible.users && Array.isArray(item.user) && item.user.length > 0;

    return (
      <div
        key={`${keyPrefix}-${party.id}-${item.id}`}
        className="receipt-card border-2 border-dashed border-gray-400 p-2 bg-white flex-shrink-0"
        style={{
          width: hasUsers ? "420px" : "220px",
          breakInside: "avoid",
          pageBreakInside: "avoid",
        }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dotted border-gray-400 pb-1 mb-1.5 receipt-header">
          <div className="text-sm font-bold uppercase tracking-wide receipt-title">
            {visible.partyName ? party.party_name : "Order"}
          </div>
          <div className="text-[9px] text-gray-600 receipt-subtitle">
            Order Receipt
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1 text-[10px] receipt-content">
          {visible.partyName && <Row label="Party:" value={party.party_name} />}
          {visible.itemId && <Row label="ID:" value={item.id} />}
          {visible.itemName && <Row label="Item:" value={item.name} />}
          {visible.description && (
            <div className="border-b border-dotted border-gray-400 pb-0.5">
              <div className="font-bold uppercase text-[9px] text-gray-600 mb-0.5">
                Desc:
              </div>
              <div className="text-[9px] pl-1 line-clamp-2 break-words">
                {item.description || "-"}
              </div>
            </div>
          )}
          {visible.received && <Row label="Received:" value={item.recived} />}
          {visible.cutting && <Row label="Cutting:" value={item.cuttting} />}
          {visible.cuttingDate && item.cuttingDate && (
            <Row
              label="Cutting Date:"
              value={new Date(item.cuttingDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          )}
          {visible.collected && (
            <Row label="Collected:" value={item.collected} />
          )}

          {visible.sizes && item.sizes && item.sizes.length > 0 && (
            <div className="border-b border-dotted border-gray-400 pb-1">
              <div className="font-bold uppercase text-[9px] text-gray-600 mb-1">
                Sizes Breakdown:
              </div>
              <SizesList
                items={item.sizes}
                className="border rounded-sm text-[8px] overflow-hidden"
              />
            </div>
          )}

          {/* Users */}
          {visible.users && Array.isArray(item.user) && item.user.length > 0 && (
            <div className="border-b border-dotted border-gray-400 pb-0.5">
              <div className="font-bold uppercase text-[9px] text-gray-600 mb-0.5">
                Users:
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[380px] text-[8px]">
                  <div className="grid grid-cols-[40px_70px_60px_30px_80px_1fr] font-semibold text-gray-500 border-b border-gray-300 pb-0.5">
                    <div>Menu</div>
                    <div>User</div>
                    <div>Sizes</div>
                    <div className="text-center">Done</div>
                    <div>By</div>
                    <div>Log</div>
                  </div>

                  {item.user.map((u: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[40px_70px_60px_30px_80px_1fr] text-gray-700 py-0.5 border-b border-dashed border-gray-200 last:border-0"
                    >
                      <div>{u.menuId}</div>
                      <div>{u.user?.display_name || u.user?.name}</div>
                      <div>
                        {Array.isArray(u.sizes)
                          ? u.sizes
                            .map((s: any) => `${s.size}×${s.count}`)
                            .join(", ")
                          : "-"}
                      </div>
                      <div className="text-center">{u.completed ?? 0}</div>
                      <div>{u.assigner}</div>
                      <div className="break-words max-w-[120px] whitespace-normal">
                        {u.logs}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {visible.print && (
          <div className="mt-1.5 pt-1 border-t-2 border-dotted border-gray-400 text-center">
            <div className="text-gray-400 text-[8px]">✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="lg">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-full overflow-y-auto p-0"
        >
          {/* Header */}
          <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl">All Party Orders</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {allItems.length} total orders • {totalPages} page
                  {totalPages > 1 ? "s" : ""} (flex layout)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print All
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Printable content */}
          <div id="orders-content" className="p-6 bg-white print-container">
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const startIndex = pageIndex * cardsPerPage;
              const endIndex = startIndex + cardsPerPage;
              const pageItems = allItems.slice(startIndex, endIndex);

              return (
                <div key={`page-${pageIndex}`} className="page-container mb-6">
                  <div className="print:hidden mb-4">
                    <h2 className="text-lg font-bold text-gray-700">
                      Page {pageIndex + 1} / {totalPages}
                    </h2>
                  </div>

                  {/* 🧩 FLEX LAYOUT FOR RECEIPTS */}
                  <div className="flex flex-wrap justify-center items-start gap-3 print-flex">
                    {pageItems.map(({ party, item }, i) =>
                      renderCard(
                        party,
                        item,
                        `page${pageIndex + 1}-card${i}`,
                        userRole
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* 🌟 Smart Flex Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: auto;
              margin: 0.4cm;
            }

            body * { visibility: hidden; }
            #orders-content, #orders-content * { visibility: visible; }
            #orders-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }

            .temp-hide-page, .temp-hide-page * {
              display: none !important;
              visibility: hidden !important;
            }

            /* 🌟 FLEX WRAP PRINT LAYOUT */
            .print-flex {
              display: flex !important;
              flex-wrap: wrap !important;
              justify-content: center !important;
              align-items: flex-start !important;
              gap: 0.4rem !important;
            }

            .receipt-card {
              page-break-inside: avoid;
              break-inside: avoid;
              border: 1px dashed #bbb;
              border-radius: 4px;
              background: #fff;
              padding: 0.5rem !important;
              box-sizing: border-box;
              margin: 0.2rem !important;
            }

            body.tiny-print @page { size: A6 portrait; }
            body.small-print @page { size: A5 portrait; }

            .page-container {
              page-break-after: always;
            }
            .page-container:last-child {
              page-break-after: avoid;
            }

            .print\\:hidden { display: none !important; }
            .receipt-header { padding-bottom: 0.2rem !important; }
            .receipt-content { font-size: 8px !important; }
          }
        `,
        }}
      />
    </>
  );
}
