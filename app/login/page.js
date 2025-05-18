"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/assets";
import { useTBContext } from "@/context/Context";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { useAccount, useConfig, useDisconnect, useSignMessage } from "wagmi";
import axios from "axios";
import ReactLoading from "react-loading";
import { URLs } from "@/utils/constants";
import { SiweMessage } from "siwe";
import { getRegisterStatus } from "@/utils/interact";

export default function Login() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { isAuth, setIsAuth, web3Auth } = useTBContext();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const { address, chainId } = useAccount();
  const config = useConfig();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {

      await web3Auth.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider: "email_passwordless",
        extraLoginOptions: {
          login_hint: email.trim(),
        },
      });

    } catch (e) {
      console.log(e, "=========error=====")
      setError("Failed to sign in. Please try again.");
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      const nonce = (await axios.get(`${URLs.TBBackendAuth}/getNonce`, { withCredentials: true })).data;

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to Tome Block.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });

      const messageToSign = message.prepareMessage();

      const signature = await signMessageAsync({ message: messageToSign });

      // Send the signature + message to the backend for verification
      const response = await axios.post(`${URLs.TBBackendAuth}/verify`, ({ message: message, signature: signature }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const authStatus = Boolean(response.data.ok);
      setIsAuth(authStatus);

      if (authStatus) {
        const isRegistered = await getRegisterStatus(config, address);
        if (isRegistered) router.push("/myDocs");
        else router.push("/register");
        console.log("✅ Authentication successful!");
      } else {
        console.error("❌ Authentication failed!");
      }
    } catch (error) {
      disconnect();
      console.error("Error signing message:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (web3Auth?.connected) {
      signIn();
    }
  }, [web3Auth?.connected])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-background to-chart-2/10" />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src={Logo}
            alt="Tome Block Logo"
            width={180}
            height={60}
            className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
            priority
            onClick={() => router.push('/home')}
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
              disabled={loading || !email || !web3Auth}
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