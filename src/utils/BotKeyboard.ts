import {Keyboard} from "telegram-keyboard";

export const menuButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("menu.services"), i18n.t("menu.shop")],
        [i18n.t("menu.profile"), i18n.t("menu.cart")],
        [i18n.t("menu.language"), i18n.t("menu.settings")],
        [i18n.t("menu.help"), i18n.t("menu.about")],
    ]).reply();
};

export const languageButtons = (i18n: any) => {
    return Keyboard.make([
        [
            {
                text: i18n.t("language.uz"),
                callback_data: "uz",
            },
            {
                text: i18n.t("language.ru"),
                callback_data: "ru",
            }
        ], [
            {
                text: i18n.t("language.en"),
                callback_data: "en",
            }
        ]
    ]).inline();
};

export const serviceButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("services.delivery"), i18n.t("services.payment")],
        [i18n.t("services.warranty"), i18n.t("services.return")],
        [i18n.t("services.back_to_menu")]
    ]).reply();
}

export const shopButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("shop.products"), i18n.t("shop.cart")],
        [i18n.t("shop.back_to_menu")]
    ]).reply();
}

export const profileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.edit"), i18n.t("profile.delete")],
        [i18n.t("profile.back_to_menu")]
    ]).reply();
}

export const cartButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("cart.add"), i18n.t("cart.remove")],
        [i18n.t("cart.clear"), i18n.t("cart.checkout")],
        [i18n.t("cart.back_to_menu")]
    ]).reply();
}

export const shopMenuButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("shop.menu.products_view")],
        [i18n.t("shop.menu.search_with_category")],
        [i18n.t("shop.menu.active_orders")],
        [i18n.t("shop.menu.completed_orders")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const shopCategoriesButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("shop.categories.add_category")],
        [i18n.t("shop.categories.edit_category"), i18n.t("shop.categories.all_categories")],
        [i18n.t("menu.back_to_menu"), i18n.t("shop.categories.back_to_shop_menu")]
    ]).reply();
}

export const adminProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info"), i18n.t("profile.menu.bot_statistics")],
        [i18n.t("profile.menu.bot_categories")],
        [i18n.t("profile.menu.approved_designs")],
        [i18n.t("profile.menu.unapproved_designers")],
        [i18n.t("profile.menu.approved_designers")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
}

export const designerProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info"), i18n.t("profile.menu.bot_statistics")],
        [i18n.t("profile.menu.bot_categories")],
        [i18n.t("profile.menu.unapproved_designs")],
        [i18n.t("profile.menu.approved_designs")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const userProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info")],
        [i18n.t("profile.menu.bot_categories")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
}