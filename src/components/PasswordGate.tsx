import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { config } from "@/config";

const STORAGE_KEY = "wedding_planner_unlocked";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const sitePassword = config.sitePassword ?? "";
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sitePassword) {
      setUnlocked(true);
      return;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setUnlocked(stored === "true");
  }, [sitePassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === sitePassword) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!sitePassword || unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-[hsl(350,40%,98%)] to-[hsl(346,35%,97%)] p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Wedding Planner</h1>
          <p className="text-sm text-muted-foreground">Enter password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              className="mt-1"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
