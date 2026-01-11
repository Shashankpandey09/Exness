import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart2, Globe } from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32">
                <div className="absolute top-0 transform -translate-x-1/2 left-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <motion.div variants={item} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            Live Trading v2.0 is now available
                        </motion.div>

                        <motion.h1 variants={item} className="text-5xl sm:text-7xl font-bold tracking-tight text-white">
                            Master the Markets with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                                Real-Time Precision
                            </span>
                        </motion.h1>

                        <motion.p variants={item} className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Experience the fastest, most reliable trading interface designed for professional traders.
                            Zero latency data, institutional-grade analytics, and effortless execution.
                        </motion.p>

                        <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="w-full sm:w-auto gap-2" onClick={() => navigate('/dashboard')}>
                                Launch Dashboard <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/docs')}>
                                View Documentation
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 border-t border-white/5 bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Zap className="h-6 w-6 text-yellow-400" />}
                            title="Ultra-Low Latency"
                            desc="Real-time WebSocket streaming ensures you never miss a tick."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="h-6 w-6 text-blue-400" />}
                            title="Advanced Charting"
                            desc="Institutional-grade charts powered by Lightweight Charts™."
                        />
                        <FeatureCard
                            icon={<Shield className="h-6 w-6 text-green-400" />}
                            title="Bank-Grade Security"
                            desc="Your data and assets are protected by industry-leading encryption."
                        />
                        <FeatureCard
                            icon={<Globe className="h-6 w-6 text-purple-400" />}
                            title="Global Access"
                            desc="Trade from anywhere in the world with 99.99% uptime guarantee."
                        />
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-4">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">
                        Trusted by traders worldwide
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos (Text for now as SVG is too long) */}
                        <span className="text-2xl font-bold text-white">BINANCE</span>
                        <span className="text-2xl font-bold text-white">COINBASE</span>
                        <span className="text-2xl font-bold text-white">FTX (RIP)</span>
                        <span className="text-2xl font-bold text-white">KRAKEN</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
            <div className="h-12 w-12 rounded-lg bg-black/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
        </div>
    );
}
