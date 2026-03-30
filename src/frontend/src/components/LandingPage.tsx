import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Heart, Image, Shield, Smile } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGenerateInviteCode,
  useGetInviteCodes,
  useIsCurrentUserAdmin,
  useSubmitRSVP,
} from "../hooks/useQueries";

interface LandingPageProps {
  onAccessGranted: () => void;
}

const features = [
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "End-to-end encrypted messages. Only you two can read them.",
    color: "#FF6B8A",
  },
  {
    icon: Image,
    title: "Media Sharing",
    description: "Share photos and videos privately, stored only for you.",
    color: "#A78BFA",
  },
  {
    icon: Smile,
    title: "Express More",
    description: "A love-themed space built to feel warm and personal.",
    color: "#F472B6",
  },
];

const LANDING_HEARTS = [
  { top: "10%", left: "5%", size: 24, color: "#FF6B8A", delay: 0, key: "h1" },
  { top: "20%", left: "90%", size: 18, color: "#A78BFA", delay: 1, key: "h2" },
  { top: "60%", left: "8%", size: 32, color: "#F472B6", delay: 2, key: "h3" },
  {
    top: "75%",
    left: "92%",
    size: 20,
    color: "#FF4B6E",
    delay: 0.5,
    key: "h4",
  },
  {
    top: "40%",
    left: "95%",
    size: 14,
    color: "#CE93D8",
    delay: 1.5,
    key: "h5",
  },
  { top: "85%", left: "3%", size: 16, color: "#FF80AB", delay: 2.5, key: "h6" },
];

function FloatingLandingHearts() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {LANDING_HEARTS.map((h, i) => (
        <motion.div
          key={h.key}
          className="absolute"
          style={{ top: h.top, left: h.left }}
          animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: h.delay,
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
            aria-hidden="true"
            role="presentation"
          >
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage({ onAccessGranted }: LandingPageProps) {
  const [showAccess, setShowAccess] = useState(false);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const submitRSVP = useSubmitRSVP();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const { data: inviteCodes } = useGetInviteCodes();
  const generateCode = useGenerateInviteCode();

  useEffect(() => {
    const codeFromUrl = new URLSearchParams(window.location.search).get("code");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      setShowAccess(true);
    }
  }, []);

  const handleEnter = () => {
    if (!isLoggedIn) {
      login();
      return;
    }
    setShowAccess(true);
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !inviteCode.trim()) {
      setAccessError("Please fill in both fields.");
      return;
    }
    try {
      await submitRSVP.mutateAsync({ name, attending: true, inviteCode });
      onAccessGranted();
    } catch {
      setAccessError("Invalid invite code. Please check and try again.");
    }
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen hero-gradient relative flex flex-col">
      <FloatingLandingHearts />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 fill-primary text-primary" />
          <span className="text-xl font-bold text-foreground tracking-tight">
            WhisperHeart
          </span>
        </div>
        {!isLoggedIn && (
          <Button
            variant="outline"
            size="sm"
            onClick={login}
            className="border-border/50 hover:border-primary/50 hover:text-primary"
            data-ocid="nav.button"
          >
            Sign In
          </Button>
        )}
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {!showAccess ? (
          <>
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Heart className="w-20 h-20 fill-primary text-primary" />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <Heart className="w-20 h-20 fill-primary/30 text-transparent" />
                  </motion.div>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                Whisper<span className="text-primary">Heart</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your private sanctuary. Just the two of you — chat, share, and
                connect in complete privacy.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  data-ocid="feature.card"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${f.color}22` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4"
            >
              <Button
                size="lg"
                onClick={handleEnter}
                className="chat-gradient-out border-0 text-white font-semibold text-lg px-10 py-6 rounded-full btn-glow hover:opacity-90"
                data-ocid="landing.primary_button"
              >
                <Heart className="w-5 h-5 mr-2 fill-white" />
                Enter Your Love Space
              </Button>
              {loginStatus === "logging-in" && (
                <p
                  className="text-sm text-muted-foreground"
                  data-ocid="landing.loading_state"
                >
                  Connecting...
                </p>
              )}
            </motion.div>

            {/* Admin panel */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 w-full max-w-md bg-card/60 border border-border/50 rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Admin — Invite Links
                </h3>
                <Button
                  onClick={() => generateCode.mutate()}
                  disabled={generateCode.isPending}
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 mb-3"
                  data-ocid="admin.primary_button"
                >
                  {generateCode.isPending
                    ? "Generating..."
                    : "Generate Invite Link"}
                </Button>
                {inviteCodes
                  ?.filter((c) => !c.used)
                  .map((code) => {
                    const link = `${window.location.origin}?code=${code.code}`;
                    return (
                      <div
                        key={code.code}
                        className="flex items-center gap-2 mb-2"
                      >
                        <code className="flex-1 text-xs bg-muted/50 px-3 py-1.5 rounded-lg truncate text-foreground/70">
                          {link}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(link)}
                          className="p-1.5 hover:text-primary transition-colors"
                          data-ocid="admin.secondary_button"
                        >
                          {copied === link ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-glow">
              <div className="text-center mb-6">
                <Heart className="w-12 h-12 fill-primary text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">
                  Enter Your Space
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your name and invite code to continue
                </p>
              </div>

              {!isLoggedIn ? (
                <Button
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                  className="w-full chat-gradient-out border-0 text-white font-semibold rounded-full"
                  data-ocid="access.primary_button"
                >
                  {loginStatus === "logging-in"
                    ? "Connecting..."
                    : "Sign In to Continue"}
                </Button>
              ) : (
                <form onSubmit={handleSubmitCode} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-input border-border/60 rounded-xl h-11 focus:border-primary/60"
                      data-ocid="access.input"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-input border-border/60 rounded-xl h-11 focus:border-primary/60"
                      data-ocid="access.search_input"
                    />
                  </div>
                  {accessError && (
                    <p
                      className="text-sm text-destructive"
                      data-ocid="access.error_state"
                    >
                      {accessError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={submitRSVP.isPending}
                    className="w-full chat-gradient-out border-0 text-white font-semibold rounded-full py-5"
                    data-ocid="access.submit_button"
                  >
                    {submitRSVP.isPending
                      ? "Entering..."
                      : "Enter Love Space 💕"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground/60">
        © {new Date().getFullYear()}. Built with{" "}
        <Heart className="w-3 h-3 inline fill-primary text-primary" /> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
