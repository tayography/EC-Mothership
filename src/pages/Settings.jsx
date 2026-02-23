import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette, Save, Loader2, Check, History, Trash2, Moon, Sun, Monitor } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import { createPageUrl } from "@/utils";
import { useTheme } from "../components/layout/ThemeProvider";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "leads", label: "Lead History", icon: History },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    
    try {
      await base44.entities.User.delete(user.id);
      toast.success("Account deleted successfully");
      setTimeout(() => {
        base44.auth.logout();
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <TopBar title="Settings" subtitle="Manage your preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-zinc-200/60 rounded-2xl p-6"
          >
            {activeSection === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Profile Information</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Update your personal details</p>
                </div>
                <Separator className="bg-zinc-100" />
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg shadow-violet-500/20">
                    {user?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{user?.full_name || "Loading..."}</p>
                    <p className="text-xs text-zinc-400">{user?.email || ""}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-zinc-500 mb-1.5 block">Full Name</Label>
                    <Input value={user?.full_name || ""} disabled className="rounded-xl border-zinc-200/60 bg-zinc-50" />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500 mb-1.5 block">Email</Label>
                    <Input value={user?.email || ""} disabled className="rounded-xl border-zinc-200/60 bg-zinc-50" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Notification Preferences</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Choose what you want to be notified about</p>
                </div>
                <Separator className="bg-zinc-100" />
                {[
                  { label: "Email Notifications", desc: "Receive email updates about your projects" },
                  { label: "Project Updates", desc: "Get notified when projects are updated" },
                  { label: "Team Activity", desc: "Notifications about team member actions" },
                  { label: "Weekly Report", desc: "Receive a weekly summary report" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-zinc-700">{item.label}</p>
                      <p className="text-xs text-zinc-400">{item.desc}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Security Settings</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage your account security</p>
                </div>
                <Separator className="bg-zinc-100" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-zinc-200/60 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-zinc-700">Two-Factor Authentication</p>
                      <p className="text-xs text-zinc-400">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-zinc-200/60 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-zinc-700">Login Alerts</p>
                      <p className="text-xs text-zinc-400">Get notified of unusual login activity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Customize how the dashboard looks</p>
                </div>
                <Separator className="bg-zinc-100 dark:bg-zinc-800" />
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Light", value: "light", icon: Sun },
                      { name: "Dark", value: "dark", icon: Moon },
                      { name: "System", value: "system", icon: Monitor },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.name}
                          onClick={() => setTheme(t.value)}
                          className={`p-4 rounded-xl border-2 transition-all select-none ${
                            theme === t.value 
                              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 shadow-lg shadow-cyan-500/10" 
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                          }`}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Icon className={`w-6 h-6 ${theme === t.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-400"}`} />
                          </div>
                          <p className={`text-xs font-medium ${theme === t.value ? "text-cyan-700 dark:text-cyan-300" : "text-zinc-600 dark:text-zinc-400"}`}>
                            {t.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "leads" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lead History</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">View and manage your lead history</p>
                </div>
                <Separator className="bg-zinc-100 dark:bg-zinc-800" />
                <Button
                  onClick={() => window.location.href = createPageUrl("LeadHistory")}
                  className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl select-none"
                >
                  <History className="w-4 h-4 mr-2" />
                  View Lead History
                </Button>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Security Settings</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage your account security</p>
                </div>
                <Separator className="bg-zinc-100 dark:bg-zinc-800" />
                
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Delete Account</h4>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-red-700 dark:text-red-300 mb-1.5 block">
                        Type DELETE to confirm
                      </Label>
                      <Input
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="DELETE"
                        className="bg-white dark:bg-zinc-900 border-red-300 dark:border-red-800 rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== "DELETE"}
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 rounded-lg select-none"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-zinc-100">
              <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-lg shadow-zinc-900/10">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}