"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Database, Shield, FileText, Network, Cloud, Lock, CheckCircle2, XCircle,
  KeyRound, Workflow, AppWindow, Search, Settings, Scale, Menu, X
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

          {/* Mobile navigation */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} py-4`}>
            <div className="flex flex-col space-y-4">
              <Button variant="ghost" className="w-full justify-start">Features</Button>
              <Button variant="ghost" className="w-full justify-start">Compare</Button>
              <Button variant="ghost" className="w-full justify-start">About</Button>
              <Button 
                className="w-full bg-chart-1/90 hover:bg-chart-1 text-white"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-background to-chart-2/10" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8 md:mb-16">
              <Image
                src="https://imgur.com/pJvuGQK.png"
                alt="Tome Block Logo"
                width={300}
                height={80}
                className="object-contain w-48 md:w-96"
                priority
              />
            </div>
            <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              Contract & Document Management, Decentralized
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
              A next-generation platform that streamlines workflows, automates approvals with smart contracts, and ensures tamper-proof compliance—without third-party integrations.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center px-4">
              <Button size="lg" className="bg-chart-1/90 hover:bg-chart-1 w-full md:w-auto">
                Request a Demo
              </Button>
              <Button size="lg" variant="outline" className="border-chart-2/30 hover:bg-chart-2/10 w-full md:w-auto">
                Sign Up Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 md:py-24 bg-card/50 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            Key Benefits of Tome Block
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<Network className="w-8 h-8 md:w-10 md:h-10 text-chart-1/90" />}
              title="Decentralized & Secure"
              description="Store and manage contracts/documents with IPFS for tamper-proof and verifiable records. Built-in audit trails ensure complete transparency and accountability."
            />
            <FeatureCard
              icon={<Workflow className="w-8 h-8 md:w-10 md:h-10 text-chart-2/90" />}
              title="Smart Contract Automation"
              description="Automate approvals, payments, renewals, and compliance tracking with self-executing smart contracts."
            />
            <FeatureCard
              icon={<AppWindow className="w-8 h-8 md:w-10 md:h-10 text-chart-3/90" />}
              title="Standalone & All-in-One"
              description="No need for third-party tools. Built-in e-signatures, messaging, notifications, and audit trails."
            />
            <FeatureCard
              icon={<Search className="w-8 h-8 md:w-10 md:h-10 text-chart-4/90" />}
              title="Real-Time Metadata"
              description="Fast, accurate search with scalable, real-time metadata filtering—no manual tagging required."
            />
            <FeatureCard
              icon={<Settings className="w-8 h-8 md:w-10 md:h-10 text-chart-5/90" />}
              title="Customizable & User-Friendly"
              description="Adapts to existing workflows or helps structure new ones, ensuring seamless adoption with a shallow learning curve."
            />
            <FeatureCard
              icon={<Scale className="w-8 h-8 md:w-10 md:h-10 text-chart-1/90" />}
              title="Compliance"
              description="Agentic AI compliance tools and verifiable records for enterprise needs, ensuring regulatory requirements are met."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-24 relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-background to-chart-1/10" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            How Tome Block Compares
          </h2>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[768px] px-4 md:px-0">
              <table className="w-full max-w-4xl mx-auto mb-12">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="py-4 px-4 md:px-6 text-left">Feature</th>
                    <th className="py-4 px-4 md:px-6 text-left">Our Platform (Decentralized CLM/DMS)</th>
                    <th className="py-4 px-4 md:px-6 text-left">Traditional CLM/DMS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Storage & Security",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Decentralized, tamper-proof (IPFS)" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Centralized, vulnerable to breaches" },
                    },
                    {
                      feature: "Access Control & Identity",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Web3Auth login, cryptographic authentication" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Standard username/password (higher risk)" },
                    },
                    {
                      feature: "Workflow Automation",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Smart contracts for automated approvals" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Manual or semi-automated workflows" },
                    },
                    {
                      feature: "Redlining & Approvals",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Only applied with full-party consensus" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Can be overridden or lack transparency" },
                    },
                    {
                      feature: "Audit Trail",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Immutable, verifiable blockchain-based logs" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Editable logs, prone to manipulation" },
                    },
                    {
                      feature: "Search & Organization",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Metadata auto-tagging" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Manual tagging, inconsistent search results" },
                    },
                    {
                      feature: "Collaboration & Communication",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Built-in chat & notifications with direct links" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "External emails or third-party messaging" },
                    },
                    {
                      feature: "Compliance & Risk Management",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Transparent, verifiable records for audits" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Requires third-party verification" },
                    },
                    {
                      feature: "Integration & Dependence",
                      ours: { icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />, text: "Standalone, all-in-one system" },
                      traditional: { icon: <XCircle className="w-5 h-5 flex-shrink-0 text-red-500" />, text: "Often requires third-party integrations" },
                    },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-4 px-4 md:px-6 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          {row.ours.icon}
                          <span>{row.ours.text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          {row.traditional.icon}
                          <span>{row.traditional.text}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="max-w-4xl mx-auto space-y-4 px-4 md:px-0">
                <p className="flex items-start md:items-center gap-3 text-base md:text-lg">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-1 md:mt-0" />
                  <span><span className="font-semibold">More Secure & Verifiable</span> – Eliminates central points of failure.</span>
                </p>
                <p className="flex items-start md:items-center gap-3 text-base md:text-lg">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-1 md:mt-0" />
                  <span><span className="font-semibold">More Business-Ready</span> – Unlike decentralized alternatives, built for real-world use.</span>
                </p>
                <p className="flex items-start md:items-center gap-3 text-base md:text-lg">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-1 md:mt-0" />
                  <span><span className="font-semibold">All-in-One Standalone System</span> – No need for external tools or middleware.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Teams Section */}
      <section className="py-16 md:py-24 bg-card/50 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            Built for Teams That Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Compliance & Security",
                description: "Tamper-proof audit trails & verifiable records",
              },
              {
                title: "Efficiency",
                description: "Automate processes, reduce human error",
              },
              {
                title: "Scalability",
                description: "Handle large document volumes with real-time search",
              },
              {
                title: "Collaboration",
                description: "Built-in messaging & notifications ensure smooth teamwork",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-card/50 hover:bg-card/80 transition-colors border-border/30">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-background to-chart-1/10" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              Get Started with Tome Block Today
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
              Experience the power of decentralized, automated contract and document management.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-chart-1/90 hover:bg-chart-1 w-full md:w-auto">
                Request a Demo
              </Button>
              <Button size="lg" variant="outline" className="border-chart-2/30 hover:bg-chart-2/10 w-full md:w-auto">
                Sign Up Now
              </Button>
            </div>
          </div>
        </div>
      </section>
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