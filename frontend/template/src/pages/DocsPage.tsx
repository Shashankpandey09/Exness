import { Navbar } from "../components/layout/Navbar";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-4 py-32">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold text-white">Documentation</h1>
                        <p className="text-neutral-400 text-lg">Learn how to integrate with the Exness Real-time API.</p>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">Introduction</h2>
                        <p className="text-neutral-400 leading-relaxed">
                            Exness provides a high-performance WebSocket API for real-time market data and order execution.
                            Our infrastructure is designed for low-latency trading applications.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">Authentication</h2>
                        <div className="bg-neutral-900 border border-border rounded-lg p-4 font-mono text-sm text-neutral-300">
                            <span className="text-blue-400">const</span> <span className="text-yellow-400">ws</span> = <span className="text-blue-400">new</span> WebSocket(<span className="text-green-400">'wss://api.exness.io/v1/stream'</span>);
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
