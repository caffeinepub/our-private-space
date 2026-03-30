import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Paperclip, Send, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalBlob } from "../backend";
import type { ChatMessage } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteMessage,
  useGetAllMessages,
  useGetCallerProfile,
  useSendMessage,
} from "../hooks/useQueries";
import FloatingHearts from "./FloatingHearts";

function formatTime(ts: bigint) {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({
  msg,
  isOwn,
  onDelete,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const mediaUrl = msg.media?.blob.getDirectURL();
  const isVideo = msg.media && /\.(mp4|webm|ogg|mov)$/i.test(msg.media.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group px-4`}
    >
      <div
        className={`relative max-w-[75%] sm:max-w-sm ${isOwn ? "items-end" : "items-start"} flex flex-col`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {isOwn && showDelete && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onDelete(msg.id)}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-destructive flex items-center justify-center shadow-md"
            data-ocid="chat.delete_button.1"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </motion.button>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwn
              ? "chat-gradient-out text-white rounded-br-sm"
              : "chat-gradient-in text-foreground rounded-bl-sm border border-border/30"
          }`}
        >
          {mediaUrl && (
            <div className="mb-2 rounded-xl overflow-hidden">
              {isVideo ? (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded media in private chat
                <video
                  src={mediaUrl}
                  controls
                  className="max-w-full max-h-48 rounded-xl"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={msg.media?.name ?? "media"}
                  className="max-w-full max-h-48 rounded-xl object-cover"
                />
              )}
            </div>
          )}

          {msg.content && (
            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
          )}
        </div>

        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [text, setText] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pendingMedia, setPendingMedia] = useState<{
    blob: ExternalBlob;
    name: string;
    previewUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: messages = [] } = useGetAllMessages();
  const { data: profile } = useGetCallerProfile();
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      const previewUrl = URL.createObjectURL(file);
      setPendingMedia({ blob, name: file.name, previewUrl });
      e.target.value = "";
    },
    [],
  );

  const handleSend = async () => {
    if (!text.trim() && !pendingMedia) return;
    const content = text.trim();
    const media = pendingMedia
      ? { blob: pendingMedia.blob, name: pendingMedia.name }
      : undefined;
    setText("");
    setPendingMedia(null);
    setUploadProgress(null);
    try {
      await sendMessage.mutateAsync({ content, media });
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMessage.mutateAsync(id);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-primary text-primary" />
          <span className="font-bold text-foreground">WhisperHeart</span>
        </div>
        <div className="h-4 w-px bg-border/50" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
          <span className="text-sm text-muted-foreground">
            {profile?.name ?? "Our Space"}
          </span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <FloatingHearts count={30} />

        <ScrollArea className="h-full scrollbar-none">
          <div className="relative z-10 pt-4 pb-2">
            {messages.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-20 text-center px-6"
                data-ocid="chat.empty_state"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  <Heart className="w-16 h-16 fill-primary/40 text-primary/40 mb-4" />
                </motion.div>
                <p className="text-muted-foreground text-sm">
                  No messages yet. Say something sweet 💕
                </p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <div key={msg.id} data-ocid={`chat.item.${i + 1}`}>
                  <MessageBubble
                    msg={msg}
                    isOwn={msg.sender.toString() === myPrincipal}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="relative z-10 border-t border-border/40 bg-card/90 backdrop-blur-md px-4 py-3">
        {pendingMedia && (
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <img
                src={pendingMedia.previewUrl}
                alt="preview"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setPendingMedia(null)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-32">
              {pendingMedia.name}
            </span>
            {uploadProgress !== null && (
              <span className="text-xs text-primary">{uploadProgress}%</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            data-ocid="chat.upload_button"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something sweet..."
            className="flex-1 bg-input border border-border/60 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
            data-ocid="chat.input"
          />

          <Button
            onClick={handleSend}
            disabled={sendMessage.isPending || (!text.trim() && !pendingMedia)}
            className="w-10 h-10 rounded-full chat-gradient-out border-0 text-white flex items-center justify-center p-0 btn-glow disabled:opacity-50 disabled:shadow-none"
            data-ocid="chat.primary_button"
          >
            {sendMessage.isPending ? (
              <Heart className="w-4 h-4 fill-white animate-pulse" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
