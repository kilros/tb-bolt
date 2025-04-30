"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

export default function LoginPage() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1", // Ethereum mainnet
          rpcTarget: "https://rpc.ankr.com/eth",
          displayName: "Ethereum Mainnet",
          blockExplorer: "https://etherscan.io",
          ticker: "ETH",
          tickerName: "Ethereum"
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig }
        });

        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
          chainConfig,
          web3AuthNetwork: "cyan",
          privateKeyProvider
        });

        const openloginAdapter = new OpenloginAdapter({
          privateKeyProvider,
          adapterSettings: {
            uxMode: "redirect",
            whiteLabel: {
              name: "Tome Block",
              logoLight: "https://imgur.com/pJvuGQK.png",
              logoDark: "https://imgur.com/pJvuGQK.png",
              defaultLanguage: "en",
              dark: true
            },
            loginConfig: {
              jwt: {
                name: "Email Login",
                verifier: "tome-block-auth",
                typeOfLogin: "jwt",
                clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
              },
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);
        await web3auth.init();
        setWeb3auth(web3auth);
      } catch (error) {
        console.error("Init error:", error);
        setError("Failed to initialize authentication. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initWeb3Auth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!web3auth) {
      setError("Authentication system is not ready. Please try again.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await web3auth.connectTo("openlogin", {
        loginProvider: "jwt",
        extraLoginOptions: {
          login_hint: email,
        },
      });
      
      const userInfo = await web3auth.getUserInfo();
      console.log("Login successful:", userInfo);
      
      router.push('/register');
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !web3auth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-chart-1" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-background to-chart-2/10" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="https://imgur.com/pJvuGQK.png"
            alt="Tome Block Logo"
            width={180}
            height={60}
            className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
            priority
            onClick={() => router.push('/')}
          />
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30">
          <h1 className="text-2xl font-bold text-center mb-6">Sign in to Tome Block</h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || !email || !web3auth}
              className="w-full bg-chart-1/90 hover:bg-chart-1 text-white h-12 text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Continue with Email"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-chart-1 hover:text-chart-1/80 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-chart-1 hover:text-chart-1/80 transition-colors">
              Privacy Policy
            </a>
          </p>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a href="#" className="text-chart-1 hover:text-chart-1/80 transition-colors">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}