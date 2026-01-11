import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-neutral-500 text-sm">Real-time market insights</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-medium text-white">
                            US
                        </div>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
