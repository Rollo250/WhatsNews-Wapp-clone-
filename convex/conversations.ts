import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    participantes: v.array(v.id("users")),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.id("_storage")),
    admin: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("No autorizado");

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participantes"), args.participantes),
          q.eq(q.field("participantes"), args.participantes.reverse())
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    let groupImage;

    if (args.groupImage) {
      groupImage = (await ctx.storage.getUrl(args.groupImage)) as string;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participantes: args.participantes,
      isGroup: args.isGroup,
      groupName: args.groupName,
      groupImage,
      admin: args.admin,
    });

    return conversationId;
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx,arg) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("No autorizado");

    const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier",(q: any) => q.eq("tokenIdentifier",identity.tokenIdentifier))
    .unique();

    if(!user) throw new ConvexError("Usuario no encontrado");

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations.filter((conversation: any) => {
      return conversation.participantes.includes(user._id);
    });

    const conversationWithDetails = await Promise.all(myConversations.map(async (conversation: any) => {
      let userDetails ={};

      if(!conversation.isGroup){
        const otherUserId = conversation.participantes.find((id: any) => id !== user._id);
        const userProfile = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("_id"), otherUserId))
        .take(1);
        
        userDetails = userProfile[0];
      }

      const lastMessage = await ctx.db
      .query("messages")
      .filter((q: any) => q.eq(q.field("conversation"), conversation._id))
      .order ("desc")
      .take(1)

      //El return tiene que ser en este orden, de otra forma el campo _id va a ser sobreescrito.
      return {
        ...userDetails,
        ...conversation,
        lastMessage: lastMessage[0] || null,
      }
    })
  )

    return conversationWithDetails;
  },
});

export const quitarUser = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("No autorizado");

    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("_id"), args.conversationId))
      .first();

      if(!conversation) throw new ConvexError("conversación no encontrada")

        await ctx.db.patch(args.conversationId, {
          participantes: conversation.participantes.filter((id) => id !== args.userId),
        });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
});
