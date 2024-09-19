import {
    adminProfileButtons,
    designerProfileButtons, designPaginationButtons,
    menuButtons,
    shopCategoriesButtons,
    shopMenuButtons, userProfileButtons
} from "./BotKeyboard";
import {CartService} from "../service/CartService";
import {Keyboard} from "telegram-keyboard";
import {User} from "../entity/User";
import consola from "consola";
import {CategoryService} from "../service/CategoryService";
import {DesignerRequestService} from "../service/DesignerRequestService";
import {UserService} from "../service/UserService";
import {Design} from "../entity/Design";
import {DesignService} from "../service/DesignService";

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

    const cartService = new CartService();
    const carts = await cartService.getCartsByTelegramId(userId.toString());
    if (typeof carts === "number") {
        return ctx.reply("Foydalanuvchi topilmadi.");
    }

    const i18n = ctx.i18n;
    if (carts.length === 0) {
        return ctx.replyWithHTML(i18n.t("cart.empty"), Keyboard.make([
            i18n.t("menu.back_to_menu")
        ]).reply());
    }

    // let cartMessage = "Sizning savatchangiz:\n";
    // carts.forEach((cart, index) => {
    //     cartMessage += `${index + 1}. Design: ${cart.design.name}, Quantity: ${cart.quantity}\n`;
    // });

    await ctx.replyWithHTML("Sizning savatchangiz:");
    // await ctx.reply(cartMessage);
};

export const shopAction = async (ctx: any): Promise<void> => {
    // @ts-ignore
    const i18n = ctx.i18n;
    await ctx.replyWithHTML(i18n.t("shop.menu.title"), shopMenuButtons(i18n));
};

export const shopProductsAction = async (ctx: any): Promise<void> => {
};

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

const designerRequestService = new DesignerRequestService();
const userService = new UserService();
const designService = new DesignService();

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

export const getMyApprovedDesignsAction = async (ctx: any): Promise<void> => {
    const userId = ctx.from.id;
    const user = await userService.getUserByTelegramId(userId.toString());
    if (user) {
        const designs = await designService.getDesignsByDesigner(user);
        if (designs.length > 0) {
            let text = "<b>Sizning tasdiqlangan dizaynlaringiz:</b>";
            designs.forEach((design: Design, index: number) => {
                text += `\n${index + 1}. ${design.title_uz}  <i>/view_${design.id}</i>`;
            });
            await ctx.replyWithHTML(text);
        } else {
            await ctx.reply("<i>Sizning tasdiqlangan dizaynlaringiz yo'q.</i>");
        }
    } else {
        await ctx.reply("<i>Foydalanuvchi topilmadi.</i>");
    }
};

export const viewDesignAction = async (ctx: any): Promise<void> => {
    let offset = 0;
    let designs = await designService.getApprovedDesignsPaginated(1, offset);
    const i18n = ctx.i18n;
    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }
    const countOnlyApprovedDesigns = await designService.getCountOfApprovedDesigns();
    await ctx.replyWithPhoto(designs[0].image, {
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        parse_mode: "HTML",
        ...designPaginationButtons(i18n, offset, countOnlyApprovedDesigns, designs[0].id)
    });
};

export const viewNextDesignAction = async (ctx: any): Promise<void> => {
    let offset = ctx.session.offset || 0;
    offset++;
    let designs = await designService.getApprovedDesignsPaginated(1, offset);
    consola.success(designs);
    const i18n = ctx.i18n;
    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }
    const countOnlyApprovedDesigns = await designService.getCountOfApprovedDesigns()
    await ctx.replyWithPhoto(designs[0].image, {
        parse_mode: "HTML",
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        ...designPaginationButtons(i18n, offset < countOnlyApprovedDesigns - 1 ? offset + 1 : countOnlyApprovedDesigns - 1, countOnlyApprovedDesigns, designs[0].id)
    });
    await deleteMessage(ctx);
};

export const viewPreviousDesignAction = async (ctx: any): Promise<void> => {
    let offset = ctx.session.offset || 0;
    offset--;
    let designs = await designService.getApprovedDesignsPaginated(1, offset < 0 ? 0 : offset);
    const i18n = ctx.i18n;
    if (designs.length === 0) {
        await ctx.replyWithHTML(i18n.t("shop.product_view.empty"));
        return;
    }
    const countOnlyApprovedDesigns = await designService.getCountOfApprovedDesigns();
    await ctx.replyWithPhoto(designs[0].image, {
        parse_mode: "HTML",
        caption: i18n.t("shop.product_view.product.text", {
            title: designs[0].title_uz,
            description: designs[0].description_uz,
            price: designs[0].price,
            category: designs[0].category.name_uz
        }),
        ...designPaginationButtons(i18n, offset < 0 ? 0 : offset, countOnlyApprovedDesigns, designs[0].id)
    });
    await deleteMessage(ctx);
};

export const addDesignToCartAction = async (ctx: any): Promise<void> => {

}

const deleteMessage = async (ctx: any): Promise<void> => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
        consola.error(e);
    }
}