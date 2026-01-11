import { PriceChart } from "../components/dashboard/PriceChart";
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Wallet } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Balance"
                    value="$124,592.00"
                    change="+12.5%"
                    trend="up"
                    icon={<Wallet className="h-4 w-4 text-blue-400" />}
                />
                <MetricCard
                    label="P&L (24h)"
                    value="+$3,240.50"
                    change="+4.2%"
                    trend="up"
                    icon={<DollarSign className="h-4 w-4 text-green-400" />}
                />
                <MetricCard
                    label="Open Positions"
                    value="8"
                    change="-2"
                    trend="down"
                    icon={<Activity className="h-4 w-4 text-purple-400" />}
                />
                <MetricCard
                    label="Margin Level"
                    value="3,200%"
                    change="Safe"
                    trend="neutral"
                    icon={<Activity className="h-4 w-4 text-yellow-400" />}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section (Takes 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <PriceChart />

                    {/* Quick Actions / Active Orders */}
                    <div className="rounded-lg border border-border bg-neutral-900/50 p-6 h-[300px]">
                        <h3 className="text-sm font-medium text-white mb-4">Active Orders</h3>
                        <div className="text-neutral-500 text-sm text-center py-20">
                            No active orders
                        </div>
                    </div>
                </div>

                {/* Order Book / Right Panel (Takes 1 column) */}
                <div className="lg:col-span-1 space-y-6">
                    <RecentTrades />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, change, trend, icon }: { label: string, value: string, change: string | number, trend: 'up' | 'down' | 'neutral', icon: any }) {
    const isUp = trend === 'up';
    const isDown = trend === 'down';

    return (
        <div className="p-4 rounded-lg border border-border bg-neutral-900/50 hover:border-primary/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-neutral-400 text-xs font-medium uppercase">{label}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-white tracking-tight">{value}</span>
                <span className={`text-xs font-medium flex items-center ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-neutral-400'}`}>
                    {isUp && <ArrowUpRight className="h-3 w-3 mr-1" />}
                    {isDown && <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {change}
                </span>
            </div>
        </div>
    );
}

function RecentTrades() {
    const trades = [
        { price: 64201.50, amount: 0.05, time: '12:01:45', type: 'buy' },
        { price: 64201.00, amount: 0.12, time: '12:01:42', type: 'sell' },
        { price: 64202.10, amount: 0.50, time: '12:01:30', type: 'buy' },
        { price: 64200.50, amount: 0.01, time: '12:01:15', type: 'sell' },
        { price: 64201.80, amount: 1.20, time: '12:01:05', type: 'buy' },
    ];

    return (
        <div className="rounded-lg border border-border bg-neutral-900/50 p-4 h-full">
            <h3 className="text-sm font-medium text-white mb-4">Recent Trades</h3>
            <div className="space-y-2">
                <div className="grid grid-cols-3 text-xs text-neutral-500 pb-2 border-b border-white/5">
                    <span>Price</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Time</span>
                </div>
                {trades.map((trade, i) => (
                    <div key={i} className="grid grid-cols-3 text-xs font-mono">
                        <span className={trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}>
                            {trade.price.toLocaleString()}
                        </span>
                        <span className="text-right text-white">
                            {trade.amount}
                        </span>
                        <span className="text-right text-neutral-500">
                            {trade.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
