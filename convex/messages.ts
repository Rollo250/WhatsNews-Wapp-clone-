import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const sendTextMessage = mutation({
    args: {
        sender:v.string(),
        content:v.string(),
        conversation:v.id("conversations"), 
    },
    handler: async (ctx,args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("No autorizado");
        }

        const user = await ctx.db.query("users")
        .withIndex("by_tokenIdentifier", q=> q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

        if (!user) {
            throw new ConvexError("Usuario no encontrado");
        }

        const conversation = await ctx.db.query("conversations")
        .filter((q) => q.eq(q.field("_id"), args.conversation))
        .first();

        if(!conversation) {
            throw new ConvexError("Conversacion no encontrada");
    }

    if(!conversation.participantes.includes(user._id)) {
        throw new ConvexError("No eres participante de esta conversacion");
    }

    await ctx.db.insert("messages", {
        sender: args.sender,
        content: args.content,
        conversation: args.conversation,
        messageType: "text",
    });

    // pendiente => add @gpt check después.
    },
});

//optimizada
export const getMessages = query({
    args: {
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("No autorizado");
        }

            const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", q => q.eq("conversation", args.conversation))
            .collect();

            const userProfileCache = new Map();
        
        const messagesWithSender = await Promise.all(
            messages.map(async (message) => {
                let sender;
                //Chequea que el perfil del sender esté en el chache
                if (userProfileCache.has(message.sender)) {
                    sender = userProfileCache.get(message.sender);
                } else {
                    //busca el perfil del sender desde la base de datos
                    sender = await ctx.db
                    .query("users")
                    .filter((q) => q.eq(q.field("_id"), message.sender))
                    .first();
                    //cache el perfil del sender
                    userProfileCache.set(message.sender, sender);
                }
                return {...message, sender};
            })
        );

        return messagesWithSender;
    }
})

//codigo sin optimizar
/*export const getMessages = query({
    args: {
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("No autorizado");
        }

        const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", q => q.eq("conversation", args.conversation))
        .collect();


        //Juan => 200
        //Sin optimizar
        const messagesWithSender = await Promise.all(
            messages.map(async (message) => {
                const sender =await ctx.db
                .query("users")
                .filter(q => q.eq(q.field("_id"), message.sender))
                .first();

                return {...message, sender};
        })
    )

    return messagesWithSender;
}
});*/