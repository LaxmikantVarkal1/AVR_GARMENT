import { authService } from "@/service/authService";
import {
  allowedRoles,
  authenticated,
  employee,
  isLogin,
  partiesAtom,
  setUserAtom,
  userRoleAtom,
} from "@/store/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { fetchPartiesAtom } from "@/lib/utils";
import HeaderTabs from "@/components/tabs";
import User from "../Dashboard/user";
import LoginPage from "./signin";
import SignupPage from "./signup";

export default function Init() {
  const isLoggedIn = useAtomValue(isLogin);
  const [, setIsLogin] = useAtom(isLogin);
  const setuser = useSetAtom(setUserAtom);
  // const [, setAllusers] = useAtom(allUsersAtom);
  const [, setUserRoles] = useAtom(allowedRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setUserRole] = useAtom(userRoleAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(authenticated);
  const fetchedParties = useAtomValue(fetchPartiesAtom);
  const [, setParties] = useAtom(partiesAtom);
  const [tasks, setEmployees] = useAtom(employee);

  const roleBasedView: any = {
    "users": <User tasks={tasks} />,
    "admin": <HeaderTabs tasks={tasks} />,
    "cutting": <HeaderTabs tasks={tasks} />,
    "distributor": <HeaderTabs tasks={tasks} />,
    "collector": <HeaderTabs tasks={tasks} />
  }

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const user: any = await authService.getCurrentUser();
        // if (
        //   user.roles.includes("admin") ||
        //   user.roles.includes("distributor")
        // ) {
        //   const allUsers: any = await authService?.getAllUsers();
        //   setAllusers(
        //     allUsers?.map((u: any) => ({ id: u.id, name: u.email || u?.name, display_name: u?.display_name || u.email.split("@")[0] })) || []
        //   );
        // }
        let result: any = [];
        fetchedParties?.[0]?.data.forEach((party: any) => {
          party.items.forEach((item: any) => {
            let task: any[] = item.user.filter(
              (u: any) => (u.user.name === user?.email))

            if (
              item.user.some(
                (u: any) => u.user.name === user?.email
              )
            ) {
              result.push({ item_name: item.name, data: task });
            }
          });
        });
        setEmployees(result);
        setParties(fetchedParties?.[0]?.data || []);
        setUserRoles(user.roles);
        setUserRole(user.roles[0]);
        setuser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        setIsLogin(true);
        setIsLoading(false);
        setIsAuthenticated(false);
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  return !isLoading ? (
    <div className="flex-1">
      {/* <MainDashboard /> */}
      {!isAuthenticated ? (
        isLoggedIn ? (
          <LoginPage />
        ) : (
          <SignupPage />
        )
      ) : (
        roleBasedView[role]
      )}
    </div>
  ) : (
    <span>Loading ...</span>
  );
}
