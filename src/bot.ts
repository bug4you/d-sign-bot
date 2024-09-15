import {session, Telegraf} from "telegraf";
import "dotenv/config";
import "reflect-metadata";
import TelegrafI18n from "telegraf-i18n";
import {AppDataSource} from "./data-source";
import {UserService} from "./service/UserService";
import consola from "consola";
import {resolve} from "node:path";
import {languageButtons, menuButtons} from "./utils/BotKeyboard";
import {
    cartAction,
    profileAction, profileBotStatisticsAction,
    profileInfoAction,
    shopAction,
    shopCategoriesAction,
    startAction
} from "./utils/BotActions";

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

        // @ts-ignore
        const bot = new Telegraf(process.env.BOT_TOKEN);

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

        bot.start(startAction);

        bot.on("text", async (ctx) => {
            // @ts-ignore
            const i18n = ctx.i18n;
            switch (ctx.message.text) {
                case i18n.t("menu.services"):
                    await ctx.replyWithHTML(i18n.t("services"));
                    break;
                case i18n.t("menu.shop"):
                case i18n.t("shop.categories.back_to_shop_menu"):
                    await shopAction(ctx);
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
                    await ctx.replyWithHTML(i18n.t("help"));
                    break;
                case i18n.t("menu.about"):
                    await ctx.replyWithHTML(i18n.t("about"));
                    break;
                case i18n.t("menu.back_to_menu"):
                    await startAction(ctx);
                    break;
                case i18n.t("profile.menu.bot_categories"):
                    await shopCategoriesAction(ctx);
                    break;
                case i18n.t("shop.categories.add_category"):
                    await ctx.replyWithHTML("Add category");
                    // await ctx.replyWithHTML(i18n.t("shop.categories.add_category"));
                    break;
                case i18n.t("shop.categories.edit_category"):
                    await ctx.replyWithHTML("Edit category");
                    // await ctx.replyWithHTML(i18n.t("shop.categories.edit_category"));
                    break;
                case i18n.t("shop.categories.all_categories"):
                    await ctx.replyWithHTML("All categories");
                    break;
                case i18n.t("profile.menu.profile_info"):
                    let user = await userService.getUserByTelegramId(ctx.from.id);
                    await profileInfoAction(ctx, user);
                    break;
                case i18n.t("profile.menu.bot_statistics"):
                    await profileBotStatisticsAction(ctx);
                    break;
                default:
                    await ctx.reply(i18n.t("unknown_command"));
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
