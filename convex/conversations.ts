import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";


export const createConversation = mutation({
    args: {
        participantes: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("storage")),
        admin: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new ConvexError("No autorizado");

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
            return existingConversation._id
        }

        let groupImage;

        if(args.groupImage) {
            //pendiente subir imagenes
        }

        const conversationId = await ctx.db.insert("conversations", {
            participantes: args.participantes,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin
        })

        return conversationId;
    },
});