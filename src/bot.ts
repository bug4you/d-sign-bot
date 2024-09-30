import {Scenes, session, Telegraf} from "telegraf";
import "dotenv/config";
import "reflect-metadata";
import TelegrafI18n from "telegraf-i18n";
import {AppDataSource} from "./data-source";
import {UserService} from "./service/UserService";
import consola from "consola";
import {resolve} from "node:path";
import {languageButtons, menuButtons, newDesignAdminConfirmationButtons} from "./utils/BotKeyboard";
import {
    addCategoryAction,
    addNewDesignAction,
    addToCartAction,
    adminDesignerApprovalAction,
    adminDesignerDeclineAction,
    backToShopMenuAction,
    cartAction,
    clearCartAction,
    getAllApprovedDesignersAction,
    getAllApprovedDesignsAction,
    getAllPendingDesignersAction,
    getAllPendingDesignsAction,
    getCategoriesAction,
    getDesignerRequestByIdAction,
    getMyApprovedDesignsAction,
    getMyApprovedViewDesignAction,
    getMyPendingDesignsAction,
    getMyPendingViewDesignAction,
    profileAction,
    profileBotStatisticsAction,
    profileInfoAction,
    removeFromCartAction,
    shopCategoriesAction,
    shopMenuAction,
    shopMyActiveOrdersAction,
    shopMyCompletedOrdersAction,
    startAction,
    viewAdminDesignAction,
    viewDesignAction,
    viewDesignAllCategoryAction,
    viewDesignWithCategoryAction,
    viewNextDesignAction,
    viewNextDesignWithCategoryAction,
    viewPreviousDesignAction,
    viewPreviousDesignWithCategoryAction
} from "./utils/BotActions";
import {CategoryService} from "./service/CategoryService";
import {
    designerLastNameRequestScene,
    designerNameRequestScene,
    designerPassportRequestScene,
    designerPhoneRequestScene,
    designerRequestConfirmationScene
} from "./wizard/DesignerRequestWizard";
import {
    newDesignCategoryScene,
    newDesignConfirmationScene,
    newDesignDescriptionScene,
    newDesignImageScene,
    newDesignPriceScene,
    newDesignTitleScene
} from "./wizard/AddNewDesignWizard";
import {DesignService} from "./service/DesignService";
import {CartService} from "./service/CartService";
import {userRegisterFirstName, userRegisterLastName, userRegisterPhone} from "./wizard/OrderRegisterWizard";

// Initialize TypeORM
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
        // Create and configure Telegraf bot
        const I18n = new TelegrafI18n({
            defaultLanguage: "uz",
            defaultLanguageOnMissing: true,
            useSession: true,
            sessionName: "session",
            allowMissing: false,
            directory: resolve(__dirname, "locales"),
        });

        const userService = new UserService();
        const categoryService = new CategoryService();
        const designService = new DesignService();
        const cartService = new CartService();

        // @ts-ignore
        const bot = new Telegraf(process.env.BOT_TOKEN);
        // @ts-ignore
        const stage = new Scenes.Stage([designerNameRequestScene, designerLastNameRequestScene, designerPassportRequestScene, designerRequestConfirmationScene, designerPhoneRequestScene, newDesignTitleScene, newDesignPriceScene, newDesignConfirmationScene, newDesignDescriptionScene, newDesignImageScene, newDesignCategoryScene, userRegisterFirstName, userRegisterLastName, userRegisterPhone]);

        bot.use(session());
        bot.use(I18n.middleware());
        bot.use(async (ctx, next) => {
            const userId = ctx.from?.id;
            const user = await userService.getUserByTelegramId(userId);
            // @ts-ignore
            ctx.session = ctx.session || {};
            if (user) {
                // @ts-ignore
                ctx.i18n.locale(user.language);  // Set language from the database
                // @ts-ignore
                ctx.session.role = user.role;
            } else {
                // @ts-ignore
                const userId = ctx.from.id;
                let isAdmin = process.env.BOT_ADMIN_ID === userId.toString();

                const newUser = {
                    telegram_id: userId.toString(),
                    first_name: ctx.from?.first_name || '',
                    last_name: ctx.from?.last_name || '',
                    username: ctx.from?.username || '',
                    phone: '',
                    language: "uz",
                    role: isAdmin ? "admin" : "user",
                };

                let savedUser = await userService.createUser(newUser);
                consola.box(savedUser);

                // @ts-ignore
                ctx.i18n.locale("uz");
                // @ts-ignore
                ctx.session.role = savedUser.role;
            }
            return next();
        });
        // @ts-ignore
        bot.use(stage.middleware());

        bot.start(startAction);

        bot.action(/approve_/, adminDesignerApprovalAction);
        bot.action(/decline_/, adminDesignerDeclineAction);
        bot.action("check_later", async (ctx) => {
            try {
                await ctx.deleteMessage();
            } catch (e) {
                // @ts-ignore
                consola.error(e.message);
            }
        });
        bot.command(/rfc_([0-9]+)/, removeFromCartAction);

        // bot.command(/view_([0-9]+)/, viewDesignAction);

        bot.hears(/aview_([0-9]+)/, viewAdminDesignAction);

        bot.hears(/view_designer_([0-9]+)/, async (ctx) => {
            await getDesignerRequestByIdAction(ctx);
        });

        /**
         * Mening tasdiqlanmagan dizaynlarimni ko'rish uchun
         * @type {RegExp}
         * @param ctx
         * */
        bot.hears(/mpvdesign_([0-9]+)/, async (ctx) => {
            consola.info(ctx.message.text);
            await getMyPendingViewDesignAction(ctx);
        });

        bot.hears(/mvdesign_([0-9]+)/, async (ctx) => {
            await getMyApprovedViewDesignAction(ctx);
        });

        bot.on("text", async (ctx) => {
            // @ts-ignore
            const i18n = ctx.i18n;
            // @ts-ignore
            if (ctx.session.awaitingCategoryName) {
                let text = ctx.message.text;
                let isCategoryNameTaken = await categoryService.isCategoryNameTaken(text);
                if (isCategoryNameTaken) {
                    await ctx.replyWithHTML(i18n.t("profile.category.add.taken"));
                    return;
                }
                // @ts-ignore
                await categoryService.createCategory({name_uz: text?.trim()});
                // @ts-ignore
                ctx.session.awaitingCategoryName = false;
                await ctx.replyWithHTML(i18n.t("profile.category.add.success", {categoryName: text}));
                consola.success("Category created successfully");
                return;
            }
            // @ts-ignore
            if (ctx.session.awaitingCategoryUpdate) {
                let text = ctx.message.text;
                // @ts-ignore
                let categoryId = ctx.session.awaitingCategoryUpdate.id;
                let isCategoryNameTaken = await categoryService.isCategoryNameTaken(text);
                if (isCategoryNameTaken) {
                    await ctx.reply(i18n.t("profile.category.add.taken"));
                    return;
                }
                // @ts-ignore
                await categoryService.updateCategory(categoryId, {name_uz: text?.trim()});
                // @ts-ignore
                ctx.session.awaitingCategoryUpdate = null;
                await ctx.reply(i18n.t("profile.category.edit.success", {categoryName: text}));
                consola.success("Category updated successfully");
                return
            }
            switch (ctx.message.text) {
                case i18n.t("menu.services"):
                    await ctx.replyWithHTML(i18n.t("services"));
                    break;
                case i18n.t("menu.shop"):
                case i18n.t("shop.categories.back_to_shop_menu"):
                    await shopMenuAction(ctx);
                    break;
                case i18n.t("menu.profile"):
                    await profileAction(ctx);
                    break;
                case i18n.t("menu.cart"):
                    await cartAction(ctx);
                    break;
                case i18n.t("menu.language"):
                    await ctx.replyWithHTML(i18n.t("language.description"), languageButtons(i18n));
                    break;
                case i18n.t("menu.settings"):
                    await ctx.replyWithHTML(i18n.t("settings"));
                    break;
                case i18n.t("menu.help"):
                    await ctx.replyWithHTML(i18n.t("help.title"));
                    break;
                case i18n.t("menu.about"):
                    await ctx.replyWithHTML(i18n.t("about.text"));
                    break;
                case i18n.t("menu.back_to_menu"):
                    await startAction(ctx);
                    break;
                case i18n.t("profile.menu.bot_categories"):
                    await shopCategoriesAction(ctx);
                    break;
                case i18n.t("shop.categories.add_category"):
                    await addCategoryAction(ctx, i18n);
                    // await ctx.replyWithHTML(i18n.t("shop.categories.add_category"));
                    break;
                case i18n.t("shop.categories.edit_category"):
                    await ctx.replyWithHTML("Edit category");
                    // TODO: Implement edit category action
                    // await ctx.replyWithHTML(i18n.t("shop.categories.edit_category"));
                    break;
                case i18n.t("shop.categories.all_categories"):
                    await getCategoriesAction(ctx, i18n);
                    break;
                case i18n.t("shop.menu.products_view"):
                    await viewDesignAction(ctx);
                    break;
                // Mening buyurtmalarim("active", "pending")
                case i18n.t("shop.menu.my_active_orders"):
                    await shopMyActiveOrdersAction(ctx);
                    break;
                // Mening buyurtmalarim("completed")
                case i18n.t("shop.menu.my_completed_orders"):
                    await shopMyCompletedOrdersAction(ctx);
                    break;
                // Barcha dizaynlar ro'yxatini olishi uchun kategiyalar orqali qidirish
                case i18n.t("shop.menu.search_with_category"):
                    await viewDesignAllCategoryAction(ctx);
                    break;
                case i18n.t("profile.menu.profile_info"):
                    let user = await userService.getUserByTelegramId(ctx.from.id);
                    await profileInfoAction(ctx, user);
                    break;
                case i18n.t("profile.menu.bot_statistics"):
                    await profileBotStatisticsAction(ctx);
                    break;
                case i18n.t("profile.menu.being_designer"): {
                    // @ts-ignore
                    ctx.scene.enter("DesignerNameRequestScene");
                    break;
                }
                // List of all unapproved designers for admin(ADMIN)
                case i18n.t("profile.menu.unapproved_designers"):
                    await getAllPendingDesignersAction(ctx);
                    break;
                // List of all unapproved designers for admin(ADMIN)
                case i18n.t("profile.menu.approved_designers"):
                    await getAllApprovedDesignersAction(ctx);
                    break;
                case i18n.t("profile.menu.approved_designs"):
                    await getAllApprovedDesignsAction(ctx);
                    break;
                case i18n.t("profile.menu.unapproved_designs"):
                    await getAllPendingDesignsAction(ctx);
                    break;
                case i18n.t("profile.menu.add_new_design"):
                    await addNewDesignAction(ctx);
                    break;
                case i18n.t("profile.menu.me_approved_design"):
                    await getMyApprovedDesignsAction(ctx);
                    break;
                case i18n.t("profile.menu.me_not_approved_design"):
                    await getMyPendingDesignsAction(ctx);
                    break;
                case i18n.t("cart.clear"):
                    await clearCartAction(ctx);
                    break;
                default:
                    await ctx.replyWithHTML(i18n.t("unknown_command"), menuButtons(i18n));
                    break;
            }
        });

        bot.action(["uz", "ru", "en"], async (ctx) => {
            const userId = ctx.from?.id;
            if (userId) {
                // @ts-ignore
                const i18n = ctx.i18n;
                const language = ctx.match;
                // @ts-ignore
                await userService.updateUserLanguage(userId, language[0]);
                console.log(language[0]);
                i18n.locale(language[0]);
                await ctx.answerCbQuery(i18n.t("language.changed"));
                await ctx.deleteMessage();
                await startAction(ctx);
            }
        });

        bot.action("confirm_new_design_in_wizard", async (ctx) => {
            consola.info("Dizaynimni tasdiqlash uchun ishga tushdi");
            // @ts-ignore
            const i18n = ctx.i18n;
            // @ts-ignore
            const designService = new DesignService();
            const userService = new UserService();
            // Foydalanuvchi ma'lumotlarini olish
            // @ts-ignore
            const user = await userService.getUserByTelegramId(ctx.from.id);
            // Dizayn ma'lumotlarini session'dan olish
            // @ts-ignore
            const newDesignData = ctx.session.newDesign;
            let category = await categoryService.getCategoryById(newDesignData.categoryId);

            if (!user || !newDesignData || !category) {
                await ctx.replyWithHTML(i18n.t("design.add.error"));
                return;
            }
            console.clear();
            consola.box(category);
            try {
                // Yangi dizaynni yaratish
                // @ts-ignore
                let createdDesign = await designService.createDesign(user, {
                    title_uz: newDesignData.title,
                    description_uz: newDesignData.description,
                    image: newDesignData.image,
                    price: newDesignData.price,
                    category,
                    status: 'pending'
                });

                await ctx.replyWithHTML(i18n.t("design.add.wizard.view.confirmed"), menuButtons(i18n));
                // Admin uchun dizayn ma'lumotlarini yuborish
                // @ts-ignore
                await ctx.telegram.sendPhoto(process.env.BOT_ADMIN_ID, newDesignData.image, {
                    caption: `${i18n.t("design.add.wizard.view.new_design")}\n\n${i18n.t("design.add.wizard.view.tag_title")} <i>${newDesignData.title}</i>\n${i18n.t("design.add.wizard.view.tag_description")} <i>${newDesignData.description}</i>\n${i18n.t("design.add.wizard.view.tag_price")} <i>${newDesignData.price}</i>`,
                    parse_mode: "HTML",
                    ...newDesignAdminConfirmationButtons(i18n, createdDesign.id)
                });
                await ctx.replyWithHTML(i18n.t("design.add.wizard.view.confirmed"), menuButtons(i18n));
                await ctx.deleteMessage();
            } catch (error) {
                consola.error("Yangi dizayn yaratishda xatolik:", error);
                await ctx.replyWithHTML(i18n.t("design.add.error"));
            }

            // @ts-ignore
            ctx.scene.leave();
        });

        bot.action("decline_new_design_in_wizard", async (ctx) => {
            consola.warn("Yangi dizayn rad etish uchun ishga tushdi");
            // @ts-ignore
            const i18n = ctx.i18n;
            // @ts-ignore
            const newDesignData = ctx.session.newDesign;
            if (newDesignData) {
                await ctx.replyWithHTML(i18n.t("design.add.wizard.view.design_rejected"), menuButtons(i18n));
                // @ts-ignore
                ctx.session.newDesign = null;
                await ctx.deleteMessage();
            }
            // @ts-ignore
            ctx.scene.leave();
        });

        // Admin dizayner so'rovlarni ko'rish va tasdiqlashi uchun
        bot.action(/confirm_new_design_/i, async (ctx) => {
            // @ts-ignore
            let splitElementId = ctx.callbackQuery.data.split("_")[3];
            let design = await designService.getDesignById(splitElementId);
            if (design) {
                let data = await designService.updateDesignStatus(splitElementId, "approved");
                await ctx.replyWithHTML("✔ Dizayn tasdiqlandi.");
                await ctx.answerCbQuery("✔ Dizayn tasdiqlandi.");
                try {
                    // @ts-ignore
                    await ctx.telegram.sendMessage(design.designer.telegram_id, "Sizning dizayningiz tasdiqlandi.", menuButtons(ctx.i18n));
                    await ctx.deleteMessage();
                } catch (e) {
                    // @ts-ignore
                    consola.error(e.message);
                }
            }
        });

        // Admin dizayner so'rovlarni ko'rish va rad etish uchun
        bot.action(/decline_new_design_/i, async (ctx) => {
            consola.warn("Admin dizayner so'rovlarni rad etish uchun ishga tushdi");
            // @ts-ignore
            let splitElementId = ctx.callbackQuery.data.split("_")[3];
            let design = await designService.getDesignById(parseInt(splitElementId));
            await designService.updateDesignStatus(parseInt(splitElementId), "rejected");
            await ctx.replyWithHTML("❌ Dizayn rad etildi.");
            await ctx.answerCbQuery("❌ Dizayn rad etildi.");
            try {
                // @ts-ignore
                await ctx.telegram.sendMessage(design.designer.telegram_id, ctx.i18n.t("design.add.wizard.view.design_rejected"), menuButtons(ctx.i18n));
                await ctx.deleteMessage();
            } catch (e) {
                // @ts-ignore
                consola.error(e.message);
            }
        });

        // Without category (standard design navigation)
        bot.action(/next_page_(\d+)/i, viewNextDesignAction);
        bot.action(/previous_page_(\d+)/i, viewPreviousDesignAction);

// With category (category-based design navigation)
        bot.action(/next_page_category_(\d+)_(\d+)/i, viewNextDesignWithCategoryAction);
        bot.action(/previous_page_category_(\d+)_(\d+)/i, viewPreviousDesignWithCategoryAction);

        bot.action("do_nothing", async (ctx) => {
            await ctx.answerCbQuery("Do nothing");
        });

        bot.action(/with_category_([0-9]+)/, async (ctx) => {
            // @ts-ignore
            await viewDesignWithCategoryAction(ctx);
        });

        bot.action(/add_to_cart_([0-9]+)/, addToCartAction);
        bot.action("back_to_shop_menu", backToShopMenuAction);
        bot.action("clear_cart", clearCartAction);

        bot.action("checkout", async (ctx) => {
            const userId = ctx.from.id;

            let cartItems = await cartService.getUserCart(userId.toString());
            if (cartItems.length === 0) {
                // @ts-ignore
                await ctx.replyWithHTML(ctx.i18n.t("cart.empty"), menuButtons(ctx.i18n));
                return;
            }
            console.clear();
            // @ts-ignore
            ctx.scene.enter("userRegisterFirstName");
        });

        bot.catch((error): void => {
            consola.error(error);
        });

        bot.launch({
            dropPendingUpdates: true,
        }, () => {
            console.log("Bot started");
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database", error);
    });
