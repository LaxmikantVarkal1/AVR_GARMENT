"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Size {
  size: string;
  count: number;
}

interface DataEntry {
  date: string;
  user: {
    id: string;
    name: string;
  };
  sizes: Size[];
  menuId: string;
  assigner: string;
}

interface UserCard {
  item_name: string;
  data: DataEntry[];
}

interface Props {
  tasks: UserCard[];
}

const UserCardGrid: React.FC<Props> = ({ tasks }) => {
  function getDate(dateStr: Date | string) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getTotalCount(sizes: Size[]) {
    return sizes.reduce((total, size) => total + size.count, 0);
  }

  return tasks?.length ? (
    <div className="relative w-full h-full">
      <div className="overflow-y-auto h-[calc(100vh-8rem)] p-4">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tasks?.map((task, index) => {
            const data = task.data[0];
            const totalCount = getTotalCount(data.sizes);
            const assignerName = data.assigner.split("@")[0];

            return (
              <Card
                key={`${task.item_name}-${index}`}
                className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 truncate max-w-[150px]">
                    {task.item_name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-medium">
                    #{data.menuId}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500 truncate">
                    {data.user.name}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Date:</span>{" "}
                      <Badge variant="secondary" className="capitalize">
                        {getDate(data.date)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Assigner:</span>{" "}
                      <span className="font-medium truncate">
                        {assignerName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-400 mb-2">
                      Sizes & Quantities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.sizes.map((size, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-teal-50 border-teal-200"
                        >
                          <span className="font-semibold text-teal-700">
                            {size.size}
                          </span>
                          <span className="mx-1">×</span>
                          <span className="font-medium">{size.count}</span>
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-sm font-semibold bg-gray-50 rounded-lg py-1">
                      Total: {totalCount} pieces
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;
};

export default UserCardGrid;
