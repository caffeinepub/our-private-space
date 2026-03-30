import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSaveCallerProfile } from "../hooks/useQueries";

interface NameSetupProps {
  onComplete: () => void;
}

export default function NameSetup({ onComplete }: NameSetupProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const save = useSaveCallerProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    try {
      await save.mutateAsync({ name: name.trim() });
      onComplete();
    } catch {
      setError("Failed to save your name. Please try again.");
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-glow text-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="mb-4"
          >
            <Heart className="w-16 h-16 fill-primary text-primary mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What's your name?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            So your partner knows it's you 💕
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border/60 rounded-xl h-12 text-center text-lg focus:border-primary/60"
              autoFocus
              data-ocid="name_setup.input"
            />
            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="name_setup.error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={save.isPending}
              className="w-full chat-gradient-out border-0 text-white font-semibold rounded-full py-5 text-base"
              data-ocid="name_setup.submit_button"
            >
              {save.isPending ? "Saving..." : "Let's Go! 💕"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
