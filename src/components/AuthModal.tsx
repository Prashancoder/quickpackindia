import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, Phone, User as UserIcon, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid 10-digit mobile number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function AuthModal() {
  const { loginModalOpen, closeLoginModal, login, signup, isLoading } = useAuthStore();
  const syncWithServer = useCartStore((state) => state.syncWithServer);

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  if (!loginModalOpen) return null;

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
      await syncWithServer();
      toast.success("Welcome back! Logged in successfully.");
      closeLoginModal();
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      await signup(data);
      await syncWithServer();
      toast.success("Account created successfully! Welcome to QuickPack India.");
      closeLoginModal();
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-8">
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            QuickPack<span className="text-primary">India</span>
          </h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Factory-Direct Packaging Solutions
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex rounded-lg border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              tab === "login"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              tab === "signup"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-2.5 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-primary">Demo Admin & User Logins:</p>
          <p className="mt-0.5">Admin: <span className="font-mono text-foreground font-semibold">admin@quickpack.in</span> / <span className="font-mono text-foreground font-semibold">Admin@123</span></p>
          <p>User: <span className="font-mono text-foreground font-semibold">rahul.sharma@example.com</span> / <span className="font-mono text-foreground font-semibold">User@123</span></p>
        </div>

        {/* LOGIN FORM */}
        {tab === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  {...loginForm.register("email")}
                  placeholder="name@company.com"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...loginForm.register("password")}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-10 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In to Account"}
            </button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-foreground">Full Name</label>
              <div className="relative mt-1">
                <UserIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  {...signupForm.register("name")}
                  placeholder="Rahul Sharma"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
              {signupForm.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {signupForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  {...signupForm.register("email")}
                  placeholder="rahul@company.com"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
              {signupForm.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Mobile Phone</label>
              <div className="relative mt-1">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  {...signupForm.register("phone")}
                  placeholder="9876543210"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Create Password</label>
              <div className="relative mt-1">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...signupForm.register("password")}
                  placeholder="At least 6 characters"
                  className="h-10 w-full rounded-lg border border-border bg-background pr-10 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {signupForm.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Free Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
