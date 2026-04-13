import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currencies, type UserRole } from "@/lib/mock-data";
import { useUser } from "@clerk/clerk-react";
import { useExpenseCategories } from "@/contexts/ExpenseCategoriesContext";
import { useInvitations, useCreateInvitation, useDeleteInvitation } from "@/hooks/useInvitations";
import { useMe } from "@/hooks/useMe";
import { UserPlus, Mail, CreditCard, Plug, Save, X, Check, KeyRound, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleBadgeStyle: Record<string, string> = {
  owner: "bg-primary/15 text-primary",
  admin: "bg-info/15 text-info",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted/60 text-muted-foreground/80",
};

const allModules = ['Capital Tracking', 'Expense Tracking', 'Equity & Ownership', 'Task Management'];
const editableRoles: UserRole[] = ['admin', 'member', 'viewer'];

interface EditModalData {
  type: 'member' | 'invite';
  id: string;
  name: string;
  email: string;
  role: UserRole;
  modules: string[];
}

function EditMemberModal({
  data,
  onClose,
  onSave,
}: {
  data: EditModalData;
  onClose: () => void;
  onSave: (updated: EditModalData) => void;
}) {
  const [name, setName] = useState(data.name);
  const [email, setEmail] = useState(data.email);
  const [role, setRole] = useState<UserRole>(data.role);
  const [modules, setModules] = useState<string[]>(data.modules);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleModule = (mod: string) => {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            {data.type === 'invite' ? 'Edit Invitation' : 'Edit Member'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          {/* Reset Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Password</Label>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
              >
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                Send Password Reset Email
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">Reset link will be sent to <strong className="font-medium">{email}</strong></span>
              </div>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Role</Label>
            <div className="flex gap-2 flex-wrap">
              {editableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize",
                    role === r
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Module Access */}
          {(role === 'member' || role === 'viewer') && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Module Access</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {allModules.map((mod) => (
                  <label
                    key={mod}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={modules.includes(mod)}
                      onChange={() => toggleModule(mod)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="text-foreground text-xs">{mod}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ ...data, name, email, role, modules: role === 'admin' ? ['All'] : modules })}>
            <Check className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

import { getCategoryIcon, iconOptions } from "@/contexts/ExpenseCategoriesContext";

function ExpenseCategoryManager() {
  const { categories, addCategory, updateCategory, removeCategory } = useExpenseCategories();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('package');

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    setName('');
    setSelectedIcon('package');
  };

  const startEdit = (cat: { id: string; name: string; icon: string }) => {
    setEditingId(cat.id);
    setAdding(false);
    setName(cat.name);
    setSelectedIcon(cat.icon);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (adding) {
      addCategory(name.trim(), selectedIcon);
    } else if (editingId) {
      updateCategory(editingId, name.trim(), selectedIcon);
    }
    setAdding(false);
    setEditingId(null);
    setName('');
  };

  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setName('');
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" /> Expense Categories
            </h2>
            <p className="text-sm text-muted-foreground">Manage categories used across expense tracking.</p>
          </div>
          <Button variant="outline" size="sm" onClick={startAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {/* Add / Edit form */}
        {(adding || editingId) && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Category Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Subscriptions" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Icon</Label>
              <div className="flex gap-1.5 flex-wrap">
                {iconOptions.map((key) => {
                  const Icon = getCategoryIcon(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedIcon(key)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        selectedIcon === key ? "bg-primary/15 ring-2 ring-primary" : "bg-card hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4 text-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="w-3.5 h-3.5 mr-1" /> {adding ? 'Add' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* Category list */}
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [inviteRole, setInviteRole] = useState<string>('member');
  const { user } = useUser();
  const { data: me } = useMe();
  const { data: apiInvitations = [] } = useInvitations();
  const createInvitation = useCreateInvitation();
  const deleteInvitation = useDeleteInvitation();
  const [inviteEmail, setInviteEmail] = useState("");

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You' : 'You';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';
  const members = [{
    id: user?.id || '',
    name: displayName,
    email: displayEmail,
    role: (me?.role || 'owner') as string,
    modules: ['capital', 'expenses', 'equity', 'tasks', 'reports'],
    isCurrentUser: true,
  }];
  const invites = apiInvitations.filter((i) => i.status === "pending");
  const [editModal, setEditModal] = useState<EditModalData | null>(null);

  const openMemberEdit = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditModal({
      type: 'member',
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      modules: m.modules.includes('All') ? [...allModules] : [...m.modules],
    });
  };

  const openInviteEdit = (id: string) => {
    const inv = invites.find((x) => x.id === id);
    if (!inv) return;
    setEditModal({
      type: 'invite',
      id: inv.id,
      name: '',
      email: inv.email,
      role: inv.role,
      modules: [],
    });
  };

  const handleSave = (updated: EditModalData) => {
    if (updated.type === 'member') {
      // TODO: Wire to PUT /api/users when available
      toast.success("Member updated");
    } else {
      // TODO: Wire to PUT /api/invitations when available
      toast.success("Invitation updated");
    }
    setEditModal(null);
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Company Settings */}
        <Card>
          <CardContent className="p-6 space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue={me?.company?.name || ""} placeholder="Your company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" defaultValue={me?.company?.industry || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                defaultValue={me?.company?.currency || "USD"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button><Save className="w-4 h-4 mr-2" /> Save</Button>
          </CardContent>
        </Card>

        {/* Invite */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Invite Team Member</h2>
              <p className="text-sm text-muted-foreground">Send an email invitation to join your company.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input id="invite-email" type="email" placeholder="name@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2 flex-wrap">
                  {editableRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setInviteRole(role)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors",
                        inviteRole === role
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-accent"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                disabled={createInvitation.isPending || !inviteEmail}
                onClick={async () => {
                  if (!inviteEmail) return;
                  try {
                    await createInvitation.mutateAsync({ email: inviteEmail, role: inviteRole });
                    toast.success(`Invitation sent to ${inviteEmail}`);
                    setInviteEmail("");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to send invitation");
                  }
                }}
              >
                <Mail className="w-4 h-4 mr-2" /> {createInvitation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members & Invitations */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-primary">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">you</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", roleBadgeStyle[member.role])}>
                        {member.role}
                      </span>
                      <span className="text-xs text-muted-foreground">Modules: {member.modules.join(', ')}</span>
                    </div>
                  </div>
                </div>
                {!member.isCurrentUser && member.role !== 'owner' && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openMemberEdit(member.id)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                  </div>
                )}
              </div>
            ))}

            {invites.map((invite) => (
              <div key={invite.id} className="p-4 flex items-start justify-between gap-4 flex-wrap bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mt-0.5">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">Invited · {invite.role} (pending)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      try {
                        await deleteInvitation.mutateAsync(invite.id);
                        toast.success("Invitation revoked");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to revoke");
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <ExpenseCategoryManager />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Billing settings coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Plug className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Integrations coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <EditMemberModal
          data={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleSave}
        />
      )}
    </AppLayout>
  );
}
