import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { BarChart3, BookOpen, Activity } from "lucide-react";

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
        { label: "Docs", path: "/docs", icon: BookOpen },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Exness</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-white flex items-center gap-2",
                                location.pathname === item.path ? "text-white" : "text-neutral-400"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                        Sign In
                    </Button>
                    <Button size="sm" onClick={() => navigate("/dashboard")}>
                        Get Started
                    </Button>
                </div>
            </div>
        </nav>
    );
}
