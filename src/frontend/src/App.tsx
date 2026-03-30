import { Toaster } from "@/components/ui/sonner";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import ChatPage from "./components/ChatPage";
import LandingPage from "./components/LandingPage";
import NameSetup from "./components/NameSetup";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerProfile } from "./hooks/useQueries";

type AppView = "landing" | "name-setup" | "chat";

export default function App() {
  const { loginStatus, identity } = useInternetIdentity();
  const { isFetching: actorLoading } = useActor();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();

  const [view, setView] = useState<AppView>("landing");
  const [accessGranted, setAccessGranted] = useState(false);

  // Check URL for invite code — auto-show access flow
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      setAccessGranted(false); // will prompt for code
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setView("landing");
      return;
    }
    if (actorLoading || profileLoading) return;
    if (!accessGranted && !profile) {
      // logged in but no RSVP yet — stay on landing to enter code
      setView("landing");
      return;
    }
    if (accessGranted && !profile) {
      setView("name-setup");
      return;
    }
    setView("chat");
  }, [isLoggedIn, actorLoading, profileLoading, profile, accessGranted]);

  const handleAccessGranted = () => {
    setAccessGranted(true);
  };

  const handleNameComplete = () => {
    setView("chat");
  };

  // Loading splash
  if (isLoggedIn && (actorLoading || profileLoading) && view === "landing") {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-12 h-12 fill-primary text-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading your space...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === "landing" && (
        <LandingPage onAccessGranted={handleAccessGranted} />
      )}
      {view === "name-setup" && <NameSetup onComplete={handleNameComplete} />}
      {view === "chat" && <ChatPage />}
      <Toaster />
    </>
  );
}
