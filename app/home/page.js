"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2, XCircle,
  Workflow, AppWindow, Search, Settings, Scale, Menu, X,
  Network
} from "lucide-react";
import { useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="https://imgur.com/pJvuGQK.png"
                alt="Tome Block Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex gap-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Compare</Button>
              <Button variant="ghost">About</Button>
              <Button
                className="bg-chart-1/90 hover:bg-chart-1 text-white"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="p-6 bg-card/50 hover:bg-card/80 transition-colors border-border/30">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}