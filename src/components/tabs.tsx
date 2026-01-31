import { Tabs, TabsContent } from "@/components/ui/tabs";
import UserCardGrid from "./gridCard";
import { AccessControl } from "@/app/Dashboard/accessControl";
import MainDashboard from "@/app/Dashboard/page";
// import { userRoleAtom } from "@/store/atoms";
// import { useAtomValue } from "jotai";
//import Layout from "@/app/Dashboard/layout";



export default function HeaderTabs({ tasks }: any) {
  // const role = useAtomValue(userRoleAtom);
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Tabs defaultValue="account">
        <div className="flex items-center gap-2 p-6">
          <img src="https://app-cdn.logo.com/public/assets/asset_019c0828-8df3-7637-86a1-3a0bef105bba.svg" width={50} height={50} alt="" />
          <span className="text-2xl font-bold">AVR</span> <span className="text-2xl font-bold">Garment</span>
        </div>
        {/* <TabsList className="ml-auto m-5">
          <TabsTrigger value="account">Dashboard</TabsTrigger>
          <TabsTrigger value="password">Tasks</TabsTrigger>
          {role == "admin" && <TabsTrigger value="users">Users</TabsTrigger>}

        </TabsList> */}
        <TabsContent value="account">
          <MainDashboard />
          {/* <Layout /> */}
        </TabsContent>
        <TabsContent value="password">
          <UserCardGrid tasks={tasks} />
        </TabsContent>
        <TabsContent value="users">
          <AccessControl />
        </TabsContent>
      </Tabs>
    </div>
  );
}
