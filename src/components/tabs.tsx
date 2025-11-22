import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserCardGrid from "./gridCard";
import { AccessControl } from "@/app/Dashboard/accessControl";
import MainDashboard from "@/app/Dashboard/page";
import { userRoleAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";



export default function HeaderTabs({tasks}:any) {
  const role = useAtomValue(userRoleAtom);
  return  (
    <div className="flex flex-1 flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList className="ml-auto m-5">
          <TabsTrigger value="account">Dashboard</TabsTrigger>
          <TabsTrigger value="password">Tasks</TabsTrigger>
          { role== "admin" && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>
        <TabsContent value="account">
          <MainDashboard />
        </TabsContent>
        <TabsContent value="password">
          <UserCardGrid tasks={tasks} />
        </TabsContent>
        <TabsContent value="users">
        <AccessControl/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
