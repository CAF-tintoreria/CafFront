import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const NavigateRoute = ({path}) => {
  return (
    <Link to={path} className="inline-flex">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </Link>
  );
};
