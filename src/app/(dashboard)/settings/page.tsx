"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield, User } from "lucide-react";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "broker">("broker");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at");
      setProfiles((data as Profile[]) || []);
    }
    fetch();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setMessage("");

    // Use Supabase admin invite (requires service role in production)
    // For now, create user with signup
    const { error } = await supabase.auth.signUp({
      email: inviteEmail,
      password: crypto.randomUUID(), // temporary password
      options: {
        data: {
          full_name: inviteName,
          role: inviteRole,
        },
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Invitation sent to ${inviteEmail}. They'll receive an email to set their password.`);
      setInviteEmail("");
      setInviteName("");
      // Refresh profiles
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at");
      setProfiles((data as Profile[]) || []);
    }
    setInviting(false);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Team Members */}
      <div className="bg-card border rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-4">Team Members</h2>
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members found. Connect Supabase to see users.</p>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-md bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {p.full_name || "Unnamed"}
                      {p.id === currentUser && (
                        <span className="text-xs text-muted-foreground ml-2">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium">
                  {p.role === "admin" && <Shield className="h-3 w-3" />}
                  <span className="capitalize">{p.role}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-card border rounded-lg p-5">
        <h2 className="font-semibold mb-4">Invite Team Member</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="form-input"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="form-input"
                placeholder="jane@company.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "broker")}
              className="form-input max-w-xs"
            >
              <option value="broker">Broker</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {message && (
            <p
              className={`text-sm ${message.startsWith("Error") ? "text-destructive" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
          <Button disabled={inviting} className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            {inviting ? "Sending..." : "Send Invite"}
          </Button>
        </form>
      </div>
    </div>
  );
}
