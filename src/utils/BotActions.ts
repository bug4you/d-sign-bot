import {
    adminProfileButtons,
    designerProfileButtons,
    menuButtons,
    shopCategoriesButtons,
    shopMenuButtons, userProfileButtons
} from "./BotKeyboard";
import {CartService} from "../service/CartService";
import {Keyboard} from "telegram-keyboard";
import {User} from "../entity/User";
import consola from "consola";

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
    await ctx.reply(i18n.t('category.add.prompt'));  // Kategoriya nomini kiritish uchun so'rov
    ctx.session.awaitingCategoryName = true;  // Bu yerda session orqali javobni kutamiz
};

export const editCategoryAction = async (ctx: any, i18n: any, categoryId: number): Promise<void> => {
    await ctx.reply(i18n.t('category.edit.prompt'));  // Tahrir qilmoqchi bo'lgan kategoriya nomini so'rang
    ctx.session.awaitingCategoryUpdate = { id: categoryId };  // Sessionda kategoriya ID ni saqlab qo'yamiz
};

export const profileAction = async (ctx: any): Promise<void> => {
    const i18n = ctx.i18n;
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
}