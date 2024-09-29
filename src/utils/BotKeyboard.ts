import {Keyboard} from "telegram-keyboard";
import {Category} from "../entity/Category";
import consola from "consola";

type CategoryType = Category[];

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

/**
 * Shop menu buttons
 * @param i18n
 * */
export const shopMenuButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("shop.menu.products_view")],
        [i18n.t("shop.menu.search_with_category")],
        [i18n.t("shop.menu.active_orders")],
        [i18n.t("shop.menu.completed_orders")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const shopMenuOnlyUserButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("shop.menu.products_view")],
        [i18n.t("shop.menu.search_with_category")],
        [i18n.t("shop.menu.my_active_orders")],
        [i18n.t("shop.menu.completed_orders")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const searchWithCategoryButtons = (i18n: any, categories: Category[]) => {
    return Keyboard.make(categories.map((category: Category) => {
        return [
            {
                text: category.name_uz,
                callback_data: `with_category_${category.id}`
            }
        ];
    }), {
        columns: 2
    }).inline();
}

/**
 * Shop categories buttons
 * @param i18n
 * @param isAdmin
 * */
export const shopCategoriesButtons = (i18n: any, isAdmin: boolean = false) => {
    if (isAdmin) {
        return Keyboard.make([
            [i18n.t("shop.categories.add_category"), i18n.t("shop.categories.edit_category")],
            [i18n.t("shop.categories.all_categories")],
            [i18n.t("menu.back_to_menu"), i18n.t("shop.categories.back_to_shop_menu")]
        ]).reply();
    }
    return Keyboard.make([
        [i18n.t("shop.categories.all_categories")],
        [i18n.t("menu.back_to_menu"), i18n.t("shop.categories.back_to_shop_menu")]
    ]).reply();
}

export const adminProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info"), i18n.t("profile.menu.bot_statistics")],
        [i18n.t("profile.menu.unapproved_designs"), i18n.t("profile.menu.approved_designs")],
        [i18n.t("profile.menu.bot_categories")],
        [i18n.t("profile.menu.unapproved_designers"), i18n.t("profile.menu.approved_designers")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
}

export const designerProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info"), i18n.t("profile.menu.bot_statistics")],
        [i18n.t("profile.menu.add_new_design")],
        [i18n.t("profile.menu.me_not_approved_design")],
        [i18n.t("profile.menu.me_approved_design")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const designCategoryButtons = (i18n: any, categories: CategoryType) => {
    return Keyboard.make(categories.map((category: Category) => {
        return [
            {
                text: category.name_uz,
                callback_data: `category_${category.id}`
            }
        ];
    })).inline({
        columns: 2
    });
}

export const newDesignConfirmationButtons = (i18n: any) => {
    return Keyboard.make([
        [
            {
                text: i18n.t("design.add.wizard.view.i_checked"),
                callback_data: "confirm_new_design_in_wizard"
            },
        ],
        [
            {
                text: i18n.t("design.add.wizard.view.i_deleted"),
                callback_data: "decline_new_design_in_wizard"
            }
        ]
    ]).inline();
};

export const newDesignAdminConfirmationButtons = (i18n: any, design_id: number | string) => {
    return Keyboard.make([
        [
            {
                text: i18n.t("design.add.wizard.confirmation.i_confirm"),
                callback_data: `confirm_new_design_${design_id}`
            },
        ],
        [
            {
                text: i18n.t("design.add.wizard.confirmation.i_decline"),
                callback_data: `decline_new_design_${design_id}`
            }
        ]
    ]).inline();
}

export const userProfileButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("profile.menu.profile_info")],
        [i18n.t("profile.menu.being_designer")],
        [i18n.t("menu.back_to_menu")]
    ]).reply();
};

export const designerConfirmationButtons = (i18n: any) => {
    return Keyboard.make([
        [i18n.t("designer.confirmation.i_confirm")],
        [i18n.t("designer.confirmation.i_decline")]
    ]).resize().reply();
}

export const designerConfirmationAdminButtons = (i18n: any, design_id: number | string) => {
    return Keyboard.make([
        [{text: i18n.t("designer.confirmation.i_confirm"), callback_data: `approve_${design_id}`}],
        [{text: i18n.t("designer.confirmation.i_decline"), callback_data: `decline_${design_id}`}],
        [{text: i18n.t("designer.confirmation.i_will_check_later"), callback_data: `check_later`}]
    ]).inline();
};

export const designPaginationButtons = (
    i18n: any,
    offset: number,
    total: number,
    design_id: number | string,
    isCategory = false,
    category_id?: number
) => {
    let nextCallback = isCategory
        ? `next_page_category_${category_id}_${offset}`
        : `next_page_${offset}`;

    let previousCallback = isCategory
        ? `previous_page_category_${category_id}_${offset}`
        : `previous_page_${offset}`;

    return Keyboard.make([
        [
            {
                text: i18n.t("pagination.previous"),
                callback_data: offset > 0 ? previousCallback : "do_nothing" // Disable if no previous page
            },
            {
                text: `${offset + 1}/${total}`,
                callback_data: "do_nothing" // No action on clicking page display
            },
            {
                text: i18n.t("pagination.next"),
                callback_data: offset < total - 1 ? nextCallback : "do_nothing" // Disable if no next page
            }
        ],
        [
            {
                text: i18n.t("shop.product_view.product.add_to_cart"),
                callback_data: `add_to_cart_${design_id}`
            }
        ],
        [
            {
                text: i18n.t("shop.product_view.back_to_shop_menu"),
                callback_data: "back_to_shop_menu"
            }
        ]
    ]).inline();
};

