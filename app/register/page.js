"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Loader2, AlertCircle, User, Building2, AtSign, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerUser, subscribe } from "@/utils/interact";
import { useAccount, useConfig } from "wagmi";
import { positions } from "@/utils/constants";

export default function RegisterPage() {

  const { address } = useAccount();
  const config = useConfig();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    companyName: "",
    position: "",
  });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.userName) {
      setError("First name, last name, and userName are required");
      return;
    }

    if (!/^[a-z]+$/.test(formData.userName)) {
      setError("Only lower letters are available for username");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let res = await subscribe(config, address);
      if (res) {
        res = await registerUser(config, formData.userName, formData.firstName, formData.lastName, formData.companyName, formData.position);
        if (res) {
          router.push('/myDocs');
        } else {
          setError("Failed to complete registration. Please try again.");
        }
      } else {
        setError("Failed to subscribe. Please try again.");
      }

    } catch (error) {
      console.error("Registration error:", error);
      setError(error?.message || "Failed to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePositionChange = (value) => {
    setFormData({
      ...formData,
      position: value,
    });
  };

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
          <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Username *</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userName"
                  name="userName"
                  placeholder="johndoe"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position in Company (Optional)</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  disabled={loading}
                  value={formData.position}
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger className="w-full pl-9">
                    <SelectValue placeholder="Select your position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position.toLowerCase()}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-chart-1/90 hover:bg-chart-1 text-white h-12 text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}