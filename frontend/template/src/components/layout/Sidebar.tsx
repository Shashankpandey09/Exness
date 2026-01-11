import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { LayoutDashboard, LineChart, Wallet, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const items = [
        { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
        { icon: LineChart, label: "Market", to: "/market" },
        { icon: Wallet, label: "Portfolio", to: "/portfolio" },
        { icon: Settings, label: "Settings", to: "/settings" },
    ];

    return (
        <aside className={cn(
            "h-screen border-r border-border bg-background transition-all duration-300 flex flex-col fixed left-0 top-0 z-40",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                {!collapsed && <span className="ml-3 font-bold text-lg tracking-tight text-white/90">Exness</span>}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group relative",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-3 px-3 py-2 w-full text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!collapsed && <span className="text-sm font-medium">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
