import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type { ChatMessage, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      media,
    }: {
      content: string;
      media?: { blob: ExternalBlob; name: string };
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage({ content, media });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMessage(messageId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.generateInviteCode();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inviteCodes"] }),
  });
}

export function useSubmitRSVP() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      attending,
      inviteCode,
    }: {
      name: string;
      attending: boolean;
      inviteCode: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitRSVP(name, attending, inviteCode);
    },
  });
}
