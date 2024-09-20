import {
    adminProfileButtons,
    designerProfileButtons,
    designPaginationButtons,
    menuButtons, searchWithCategoryButtons,
    shopCategoriesButtons,
    shopMenuButtons, shopMenuOnlyUserButtons,
    userProfileButtons
} from "./BotKeyboard";
import {CartService} from "../service/CartService";
import {User} from "../entity/User";
import consola from "consola";
import {CategoryService} from "../service/CategoryService";
import {DesignerRequestService} from "../service/DesignerRequestService";
import {UserService} from "../service/UserService";
import {Design} from "../entity/Design";
import {DesignService} from "../service/DesignService";
import {OrderService} from "../service/OrderService";
import {OrderItemService} from "../service/OrderItemService";
import {Category} from "../entity/Category";

const designerRequestService = new DesignerRequestService();
const userService = new UserService();
const designService = new DesignService();
const cartService = new CartService();
const orderService = new OrderService();
const orderItemService = new OrderItemService();
const categoryService = new CategoryService();

export const startAction = async (ctx: any): Promise<void> => {
    // @ts-ignore
    const i18n = ctx.i18n;
    const greetingMessage = i18n.t('greeting', {id: ctx.from.id, first_name: ctx.from.first_name});
    await ctx.replyWithHTML(greetingMessage, menuButtons(i18n));
}

export const cartAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from?.id;
    if (!userId) {
        return ctx.reply("Foydalanuvchi topilmadi.");
    }

    let userCart = await cartService.getUserCart(userId);
    let i18n = ctx.i18n;
    if (userCart.length === 0) {
        return ctx.replyWithHTML(i18n.t("cart.empty"));
    }
    let fullTextResponse = "";
    userCart.forEach((cartItem, index) => {
        fullTextResponse += i18n.t("cart.product.full_text", {
            index: index + 1,
            title: cartItem.design.title_uz,
            price: cartItem.design.price,
            quantity: cartItem.quantity,
            removeDesignId: cartItem.design.id
        });
    });

    let message = await ctx.replyWithHTML(i18n.t("cart.text", {
        products: fullTextResponse,
        cartProductSize: userCart.length
    }), {
        reply_markup: {
            inline_keyboard: [
                [{text: i18n.t("cart.checkout"), callback_data: "checkout"}],
                [{text: i18n.t("cart.clear"), callback_data: "clear_cart"}],
                [{text: i18n.t("cart.back_to_shop"), callback_data: "back_to_shop_menu"}]
            ]
        }
    });
    ctx.session.cartMessageId = message.message_id;
    console.clear();
};

export const clearCartAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    try {
        await cartService.clearUserCart(userId);
        await ctx.reply("Savatcha tozalandi.");
        await ctx.answerCbQuery("Savatcha tozalandi.");
        await ctx.deleteMessage();
        await cartAction(ctx);
    } catch (error) {
        console.error("Savatchani tozlashda xatolik:", error);
        await ctx.reply("❌ Xatolik yuz berdi.");
    }
};

export const removeFromCartAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const designId = parseInt(ctx.match[1]);
    try {
        await cartService.removeFromCart(userId, designId);
        await ctx.replyWithHTML(ctx.i18n.t("cart.product.remove.success"));
        await cartAction(ctx);
        console.clear();
        consola.success(ctx.session.cartMessageId);
        if (ctx.session.cartMessageId) {
            let deleteMessage1 = await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.cartMessageId);
            consola.warn(deleteMessage1);
        }
    } catch (error) {
        console.error("Savatchadan olib tashlashda xatolik:", error);
        await ctx.reply("❌ Xatolik yuz berdi.");
    }
};

export const shopMenuAction = async (ctx: any): Promise<void> => {
    // @ts-ignore
    const i18n = ctx.i18n;
    await ctx.replyWithHTML(i18n.t("shop.menu.title"), ctx.session.role !== "admin" ? shopMenuOnlyUserButtons(i18n) : shopMenuButtons(i18n));
};

export const shopProductsAction = async (ctx: any): Promise<void> => {
};

export const shopMyActiveOrdersAction = async (ctx: any): Promise<void> => {
    let userID = ctx.from.id;
    let user = await userService.getUserByTelegramId(userID.toString());
    if (!user) {
        return ctx.reply("Foydalanuvchi topilmadi.");
    }
    let i18n = ctx.i18n;
    let orders = await orderService.getUserOrders(user.id);
    if (orders.length === 0) {
        await ctx.reply(i18n.t("order.user.my_active_orders.empty"));
        return;
    }
    let text = "";
    let orderItems = await orderItemService.getOrderItemsByUser(user.id);
    orderItems.forEach((orderItem, index) => {
        const orderDate = new Date(orderItem.order.created_at);
        const formattedDate = orderDate.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        text += i18n.t("order.user.my_active_orders.order.item.result", {
            id: orderItem.id,
            title: orderItem.design.title_uz,
            price: orderItem.design.price,
            quantity: orderItem.quantity,
            created_at: formattedDate,
            status: orderItem.order.status
        });
    });
    consola.success("My active orders:..............................................");
    await ctx.replyWithHTML(i18n.t("order.user.my_active_orders.order.text", {
        result: text
    }));

    consola.box(i18n.t("order.user.my_active_orders.order.text", {
        result: text
    }));
}

export const shopMyCompletedOrdersAction = async (ctx: any): Promise<void> => {
    let userID = ctx.from.id;
    let user = await userService.getUserByTelegramId(userID.toString());
    if (!user) {
        return ctx.reply("Foydalanuvchi topilmadi.");
    }
    let i18n = ctx.i18n;
    let orders = await orderService.getUserOrders(user.id);
    let filteredOrders = orders.filter(order => order.status === "completed" || order.status === "canceled");

    if (filteredOrders.length === 0) {
        await ctx.replyWithHTML(i18n.t("order.user.my_completed_orders.empty"));
        return;
    }

    let text = "";
    let orderItems = await orderItemService.getOrderItemByUserAndOrderStatus(user.id, "completed", "canceled");
    consola.box(orderItems[0]);

    orderItems.forEach((orderItem) => {
        const orderDate = new Date(orderItem.order.created_at);
        const formattedDate = orderDate.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        text += i18n.t("order.user.my_completed_orders.order.item.result", {
            id: orderItem.id,
            title: orderItem.design.title_uz,
            price: orderItem.design.price,
            quantity: orderItem.quantity,
            created_at: formattedDate,
            status: orderItem.order.status
        });
    });

    consola.success("My completed orders:..............................................");
    await ctx.replyWithHTML(i18n.t("order.user.my_completed_orders.order.text", {
        result: text
    }));

    consola.box(i18n.t("order.user.my_completed_orders.order.text", {
        result: text
    }));
}

export const shopCartAction = async (ctx: any): Promise<void> => {
};

export const shopCategoriesAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    await ctx.replyWithHTML(i18n.t("shop.categories.title"), shopCategoriesButtons(i18n));
}

// src/utils/BotActions.ts
export const addCategoryAction = async (ctx: any, i18n: any): Promise<void> => {
    await ctx.replyWithHTML(i18n.t('profile.category.add.prompt'));  // Kategoriya nomini kiritish uchun so'rov
    ctx.session.awaitingCategoryName = true;  // Bu yerda session orqali javobni kutamiz
};

// TODO: Implement edit category action
export const editCategoryAction = async (ctx: any, i18n: any, categoryId: number): Promise<void> => {
    await ctx.replyWithHTML(i18n.t('category.edit.prompt'));  // Tahrir qilmoqchi bo'lgan kategoriya nomini so'rang
    ctx.session.awaitingCategoryUpdate = {id: categoryId};  // Sessionda kategoriya ID ni saqlab qo'yamiz
};

export const getCategoriesAction = async (ctx: any, i18n: any): Promise<void> => {
    const categoryService = new CategoryService();
    const categories = await categoryService.getAllCategories();
    if (categories.length === 0) {
        return ctx.replyWithHTML(i18n.t('profile.category.list.empty'));
    }
    let text = i18n.t('profile.category.list.title');
    categories.forEach((category, index) => {
        text += `\n<i>${index + 1}. ${category.name_uz} :>> /edit_category_${category.id}</i>`;
    });
    await ctx.replyWithHTML(text);
}

export const profileAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    consola.box(ctx.session.role);
    let profileButtons = ctx.session.role === "admin" ? adminProfileButtons(i18n) : ctx.session.role === "designer" ? designerProfileButtons(i18n) : userProfileButtons(i18n);
    await ctx.replyWithHTML(i18n.t("profile.menu.title"), profileButtons);
}

/**
 * Shaxsiy ma'lumotlarni ko'rish uchun ishga tushdi
 * @param ctx
 * @param user
 * @returns {Promise<void>}
 * */
export const profileInfoAction = async (ctx: any, user: User | null): Promise<void> => {
    const i18n = ctx.i18n;
    consola.box(user);
    await ctx.replyWithHTML(i18n.t("profile.info.text", {
        username: user?.username ? "@" + user.username : "N/A",
        phone: user?.phone || "N/A",
        name: user?.first_name || "N/A",
        surname: user?.last_name || "N/A",
        telegram_id: user?.telegram_id
    }));
};

/**
 * Bot statistikasini ko'rish uchun ishga tushdi
 * @param ctx
 * @returns {Promise<void>}
 * */
export const profileBotStatisticsAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    // const userCount = await userService.getUserCount();
    // const designerCount = await userService.getDesignerCount();
    // const orderCount = await orderService.getOrderCount();
    let productCount = 0;
    let categoryCount = 0;
    let designCount = 0;
    let designerCount = 0;
    let userCount = 0;
    await ctx.replyWithHTML(i18n.t("profile.bot_statistics.text", {
        userCount,
        designerCount,
        productCount,
        categoryCount,
        designCount
    }));
};

// Admin dizayner so'rovlarni ko'rish uchun ishga tushdi
export const adminDesignerApprovalAction = async (ctx: any): Promise<void> => {
    consola.warn("Admin dizayner so'rovlarni tasdiqlash uchun ishga tushdi.");
    let isAdmin = ctx.session.role === "admin";
    if (isAdmin) {
        // @ts-ignore
        let design_id = ctx.update.callback_query?.data.split("_")[1];
        // @ts-ignore
        let design = await designerRequestService.getRequestById(design_id);
        if (design) {
            await designerRequestService.approveRequest(design_id);
            await ctx.replyWithHTML("Dizayner so'rovi tasdiqlandi.");
            await userService.updateUser(design.user.id, {is_designer: true});
            await ctx.answerCbQuery("Dizayner so'rovi tasdiqlandi.");
            await ctx.telegram.sendMessage(design.user.telegram_id, "Sizning dizaynerlik so'rovingiz tasdiqlandi.", menuButtons(ctx.i18n));
            try {
                await ctx.deleteMessage();
            } catch (e) {
                consola.error(e);
            }
        }
    }
};

// Admin dizayner so'rovlarni rad etish uchun ishga tushdi
export const adminDesignerDeclineAction = async (ctx: any): Promise<void> => {
    consola.warn("Admin dizayner so'rovlarni rad etish uchun ishga tushdi.");
    let isAdmin = ctx.session.role === "admin";
    if (isAdmin) {
        // @ts-ignore
        let design_id = ctx.update.callback_query?.data.split("_")[1];
        // @ts-ignore
        let design = await designerRequestService.getRequestById(design_id);
        if (design) {
            await designerRequestService.rejectRequest(design_id);
            await ctx.replyWithHTML("Dizayner so'rovi rad etildi.");
            await ctx.answerCallbackQuery("Dizayner so'rovi rad etildi.");
            await ctx.deleteMessage();
        }
    }
};

// Dizayner bo'lish uchun foydalanuvchi so'rov yuboradi
export const requestDesignerAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const bio = "Bu mening tarjimai holim"; // Foydalanuvchi kiritadigan ma'lumotlar
    const passport = "Pasport ma'lumotlari"; // Foydalanuvchi kiritadigan ma'lumotlar

    const existingRequest = await designerRequestService.createRequest(userId, bio, passport);
    await ctx.reply("Dizayner bo'lish so'rovingiz yuborildi, admin tomonidan ko'rib chiqiladi.");
};

// Admin tomonidan tasdiqlanmagan so'rovlarni ko'rish
export const pendingRequestsAction = async (ctx: any): Promise<void> => {
    const pendingRequests = await designerRequestService.getPendingRequests();

    if (pendingRequests.length > 0) {
        for (const request of pendingRequests) {
            await ctx.replyWithHTML(
                `Foydalanuvchi: ${request.user.first_name} ${request.user.last_name}\n` +
                `Bio: ${request.bio}\n` +
                `Pasport: ${request.passport}\n` +
                `<b>Status:</b> ${request.status}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "Tasdiqlash", callback_data: `approve_${request.id}`}],
                            [{text: "Rad etish", callback_data: `reject_${request.id}`}]
                        ]
                    }
                }
            );
        }
    } else {
        await ctx.reply("Hozirda tasdiqlanmagan so'rovlar mavjud emas.");
    }
};

// src/utils/BotActions.ts ichida
export const handleDesignerApproval = async (ctx: any): Promise<void> => {

};

// Yangi dizayn qo'shish uchun ishga tushdi
export const addNewDesignAction = async (ctx: any): Promise<void> => {
    ctx.scene.enter("newDesignTitleScene");
}

// Aynan joriy foydalanuvchi uchun tasdiqlangan dizaynlarni ko'rish uchun ishga tushdi
export const getMyApprovedDesignsAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const user = await userService.getUserByTelegramId(userId.toString());
    if (user) {
        const designs = await designService.getUserApprovedDesigns(user.id);
        console.clear();
        consola.box(designs);
        if (designs.length > 0) {
            let text = "<b>Sizning tasdiqlangan dizaynlaringiz:</b>";
            designs.forEach((design: Design, index: number) => {
                text += `\n${index + 1}. ${design.title_uz}  <i>/view_${design.id}</i>`;
            });
            await ctx.replyWithHTML(text);
        } else {
            await ctx.replyWithHTML("<i>Sizning tasdiqlangan dizaynlaringiz yo'q.</i>");
        }
    } else {
        await ctx.reply("<i>Foydalanuvchi topilmadi.</i>");
    }
};

export const getMyPendingDesignsAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const user = await userService.getUserByTelegramId(userId.toString());
    if (user) {
        const designs = await designService.getUserPendingDesigns(user.id);
        console.clear();
        consola.box(designs);
        if (designs.length > 0) {
            let text = "<b>Sizning tasdiqlanmagan dizaynlaringiz:</b>";
            designs.forEach((design: Design, index: number) => {
                text += `\n${index + 1}. ${design.title_uz}  <i>/view_${design.id}</i>`;
            });
            await ctx.replyWithHTML(text);
        } else {
            await ctx.replyWithHTML("<i>Sizning tasdiqlanmagan dizaynlaringiz yo'q.</i>");
        }
    } else {
        await ctx.reply("<i>Foydalanuvchi topilmadi.</i>");
    }
};

// Dizayn ko'rish uchun ishga tushdi(SHOP)
export const viewDesignWithCategoryAction = async (ctx: any): Promise<void> => {
    const categoryId = parseInt(ctx.match[1]);
    consola.box(categoryId);

    // Set initial offset for the category in session
    let offset = ctx.session.offset_for_category || 0;

    // Fetch the category and validate
    let category = await categoryService.getCategoryById(categoryId) as Category;
    if (!category) {
        await ctx.replyWithHTML("Kategoriya topilmadi.");
        return;
    }

    // Fetch designs based on the category with pagination
    let designs = await designService.getDesignsByCategoryWithPaginated(category, offset, 1);

    const i18n = ctx.i18n;
    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }

    // Fetch the total number of approved designs in this category
    const countOnlyApprovedDesignsWithCategory = await designService.getCountOfDesignsByCategory(category);

    // Welcome message
    await ctx.replyWithHTML(i18n.t("shop.product_view.welcome"), {
        reply_markup: {remove_keyboard: true}
    });

    // Show the first design
    await ctx.replyWithPhoto(designs[0].image, {
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(i18n, offset, countOnlyApprovedDesignsWithCategory, designs[0].id)
    });

    // Delete the previous message
    await deleteMessage(ctx);
};

// Keyingi dizaynni ko'rish uchun ishga tushdi(SHOP)
export const viewNextDesignWithCategoryAction = async (ctx: any): Promise<void> => {
    const match = ctx.match; // Extract the matched parts
    const categoryId = parseInt(match[1], 10); // Extract category ID
    let offset = parseInt(match[2], 10); // Extract current offset

    offset++; // Increment the offset for the next page

    // Fetch designs by category with pagination
    // @ts-ignore
    const designs = await designService.getDesignsByCategoryWithPaginated(categoryId, offset, 1);
    // @ts-ignore
    const totalDesigns = await designService.getCountOfDesignsByCategory(categoryId);

    if (designs.length === 0) {
        await ctx.replyWithHTML(ctx.i18n.t("shop.product_view.empty"));
        return;
    }

    await ctx.replyWithPhoto(designs[0].image, {
        caption: ctx.i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(ctx.i18n, offset, totalDesigns, designs[0].id, true, categoryId)
    });

    await deleteMessage(ctx);
    console.clear();
    consola.success("Next design with category..............................................");
};

// Keyingi dizaynni ko'rish uchun ishga tushdi(SHOP)
export const viewPreviousDesignWithCategoryAction = async (ctx: any): Promise<void> => {
    const match = ctx.match;
    const categoryId = parseInt(match[1], 10);
    let offset = parseInt(match[2], 10);

    offset = offset > 0 ? offset - 1 : 0; // Decrement the offset for the previous page
    // @ts-ignore
    const designs = await designService.getDesignsByCategoryWithPaginated(categoryId, offset, 1);
    // @ts-ignore
    const totalDesigns = await designService.getCountOfDesignsByCategory(categoryId);

    if (designs.length === 0) {
        await ctx.replyWithHTML(ctx.i18n.t("shop.product_view.empty"));
        return;
    }

    await ctx.replyWithPhoto(designs[0].image, {
        caption: ctx.i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(ctx.i18n, offset, totalDesigns, designs[0].id, true, categoryId)
    });

    await deleteMessage(ctx);
    console.clear();
    consola.success("Previous design with category..............................................");
};

// Dizayn kategoriyalarini ko'rish uchun ishga tushdi(SHOP)
export const viewDesignAllCategoryAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    let message = await ctx.replyWithHTML("loading...");
    const categories = await categoryService.getAllCategories();
    if (categories.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.categories.empty"));
        return;
    }
    let text = i18n.t("shop.product_view.search_with_category.category.text");
    await ctx.replyWithHTML(text, searchWithCategoryButtons(i18n, categories));
    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
    } catch (e) {
        consola.error(e);
    }
}

// Dizayn ko'rish uchun ishga tushdi (SHOP)
export const viewDesignAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    ctx.session.offset = 0; // Start from the first design
    const offset = ctx.session.offset;

    // @ts-ignore
    const designs = await designService.getApprovedDesignsPaginated(1, offset);
    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }

    const totalDesigns = await designService.getCountOfApprovedDesigns();
    await ctx.replyWithHTML(i18n.t("shop.product_view.welcome"), {
        reply_markup: {remove_keyboard: true}
    });

    const currentDesign = designs[0]; // Display the first design
    await ctx.replyWithPhoto(currentDesign.image, {
        caption: i18n.t("shop.product_view.product.text", {
            title: currentDesign.title_uz,
            description: currentDesign.description_uz,
            price: currentDesign.price,
            category: currentDesign.category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(i18n, offset, totalDesigns, currentDesign.id)
    });
};

// Keyingi dizaynni ko'rish (SHOP)
export const viewNextDesignAction = async (ctx: any): Promise<void> => {
    let offset = ctx.session.offset || 0;

    // Increase offset to get the next design
    offset++;

    // Update session with the new offset
    ctx.session.offset = offset;

    // Fetch the designs based on the new offset
    let designs = await designService.getApprovedDesignsPaginated(offset);
    const i18n = ctx.i18n;

    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }

    const totalDesigns = await designService.getCountOfApprovedDesigns();

    await ctx.replyWithPhoto(designs[0].image, {
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(i18n, offset, totalDesigns, designs[0].id)
    });

    await deleteMessage(ctx);
};

// Oldingi dizaynni ko'rish (SHOP)
export const viewPreviousDesignAction = async (ctx: any): Promise<void> => {
    let offset = ctx.session.offset || 0;

    // Decrease the offset to get the previous design, but ensure it doesn't go below 0
    offset = offset > 0 ? offset - 1 : 0;

    // Update session with the new offset
    ctx.session.offset = offset;

    // Fetch the designs based on the new offset
    let designs = await designService.getApprovedDesignsPaginated(offset);
    const i18n = ctx.i18n;

    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }

    const totalDesigns = await designService.getCountOfApprovedDesigns();

    await ctx.replyWithPhoto(designs[0].image, {
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(i18n, offset, totalDesigns, designs[0].id)
    });

    await deleteMessage(ctx);
};

// Savatchaga qo'shish uchun ishga tushdi(SHOP)
export const addToCartAction = async (ctx: any): Promise<void> => {
    const designId = parseInt(ctx.match[1]); // Dizayn ID'sini olish
    try {
        // Savatchaga qo'shish
        await cartService.addToCart(ctx.from.id, designId);
        await ctx.answerCbQuery("✅ Dizayn savatchaga qo'shildi.");
    } catch (error) {
        console.error("Savatchaga qo'shishda xatolik:", error);
        await ctx.reply("❌ Xatolik yuz berdi.");
    }
};

// Shop menyuga qaytish uchun ishga tushdi(SHOP)
export const backToShopMenuAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
    await ctx.replyWithHTML(i18n.t("shop.menu.title"), shopMenuButtons(i18n));
    await deleteMessage(ctx);
}

const deleteMessage = async (ctx: any): Promise<void> => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
        consola.error(e);
    }
}