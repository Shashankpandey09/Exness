import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-black py-12">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-neutral-500 mb-4">
                    © 2026 Exness. Real-time Trading Intelligence.
                </p>
                <div className="flex justify-center gap-6 text-neutral-400">
                    <Github className="h-5 w-5 hover:text-white transition-colors cursor-pointer" />
                    <Twitter className="h-5 w-5 hover:text-white transition-colors cursor-pointer" />
                    <Linkedin className="h-5 w-5 hover:text-white transition-colors cursor-pointer" />
                </div>
            </div>
        </footer>
    );
}
