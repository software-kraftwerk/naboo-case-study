import { IconUserCircle } from "@tabler/icons-react";

export type SubRoute = {
  link?: string;
  action?: "logout";
  label: string;
  requiredAuth?: boolean;
};

export type Route = {
  label: string;
  route: string | SubRoute[];
  icon?: typeof IconUserCircle;
  requiredAuth?: boolean;
};
