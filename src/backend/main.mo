import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Random "mo:core/Random";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let inviteState = InviteLinksModule.initState();

  type MessageId = Text;

  type MediaReference = {
    blob : Storage.ExternalBlob;
    name : Text;
  };

  type ChatMessage = {
    id : MessageId;
    sender : Principal;
    content : Text;
    media : ?MediaReference;
    timestamp : Time.Time;
  };

  type MessageInput = {
    content : Text;
    media : ?MediaReference;
  };

  public type UserProfile = {
    name : Text;
  };

  module ChatMessage {
    public func compare(msg1 : ChatMessage, msg2 : ChatMessage) : Order.Order {
      if (msg1.timestamp < msg2.timestamp) { return #less };
      if (msg1.timestamp > msg2.timestamp) { return #greater };
      #equal;
    };
  };

  let messages = Map.empty<MessageId, ChatMessage>();
  let deletedMessages = Map.empty<MessageId, ()>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func sendMessage(input : MessageInput) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users or admins can send messages");
    };
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let message : ChatMessage = {
      id;
      sender = caller;
      content = input.content;
      media = input.media;
      timestamp = Time.now();
    };
    messages.add(id, message);
    id;
  };

  public query ({ caller }) func getAllMessages() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    let deleted = deletedMessages;
    messages.values().filter(func(m) { not deleted.containsKey(m.id) }).toArray().sort();
  };

  public shared ({ caller }) func deleteMessage(messageId : MessageId) : async () {
    let chatMessage = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) { msg };
    };
    if (not (AccessControl.isAdmin(accessControlState, caller) or caller == chatMessage.sender)) {
      Runtime.trap("Unauthorized: Only admin or original sender can delete this message");
    };
    if (deletedMessages.containsKey(messageId)) {
      Runtime.trap("Message already deleted");
    };
    deletedMessages.add(messageId, ());
  };

  public query ({ caller }) func getDeletedMessageIds() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deleted messages");
    };
    deletedMessages.keys().toArray();
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  // Grants #user role to caller after successful RSVP
  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
    switch (accessControlState.userRoles.get(caller)) {
      case (null) { accessControlState.userRoles.add(caller, #user) };
      case (?_) {};
    };
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};
