import {Scenes} from "telegraf";
import consola from "consola";
import {designerConfirmationAdminButtons, designerConfirmationButtons, menuButtons} from "../utils/BotKeyboard";
import {DesignerRequestService} from "../service/DesignerRequestService";
import {UserService} from "../service/UserService";

const designerNameRequestScene = new Scenes.BaseScene("DesignerNameRequestScene");

designerNameRequestScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("designer.text"), {
        reply_markup: {
            remove_keyboard: true
        }
    });
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("designer.first_name.prompt"));
});

designerNameRequestScene.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.first_name = ctx.message.text;
    // @ts-ignore
    ctx.scene.enter("DesignerLastNameRequestScene");
});

designerNameRequestScene.on(["contact", "location", "audio", "sticker", "channel_post", "photo"], async (ctx) => {
    // @ts-ignore
    ctx.scene.reenter();
});

const designerLastNameRequestScene = new Scenes.BaseScene("DesignerLastNameRequestScene");

designerLastNameRequestScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("designer.last_name.prompt"));
});

designerLastNameRequestScene.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.last_name = ctx.message.text;
    // @ts-ignore
    ctx.scene.enter("DesignerPhoneRequestScene");
});

designerLastNameRequestScene.on(["contact", "location", "audio", "sticker", "channel_post", "photo"], async (ctx) => {
    // @ts-ignore
    ctx.scene.reenter();
});

const designerPhoneRequestScene = new Scenes.BaseScene("DesignerPhoneRequestScene");

designerPhoneRequestScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("designer.phone.prompt"), {
        reply_markup: {
            keyboard: [
                // @ts-ignore
                [{text: ctx.i18n.t("designer.phone_in_telegram.share"), request_contact: true}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

designerPhoneRequestScene.on("contact", async (ctx) => {
    // @ts-ignore
    ctx.session.phone = ctx.message.contact.phone_number;
    // @ts-ignore
    ctx.scene.enter("DesignerPassportRequestScene");
});

designerPhoneRequestScene.on(["location", "audio", "sticker", "channel_post", "photo", "text"], async (ctx) => {
    // @ts-ignore
    ctx.scene.reenter();
});

const designerPassportRequestScene = new Scenes.BaseScene("DesignerPassportRequestScene");

designerPassportRequestScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("designer.passport_image.prompt"), {
        reply_markup: {remove_keyboard: true}
    });
});

designerPassportRequestScene.on("photo", async (ctx) => {
    // @ts-ignore
    ctx.session.passport = ctx.message.photo[0].file_id;
    // @ts-ignore
    ctx.scene.enter("DesignerRequestConfirmationScene");
});

designerPassportRequestScene.on(["contact", "location", "audio", "sticker", "channel_post", "text"], async (ctx) => {
    // @ts-ignore
    ctx.scene.reenter();
});

const designerRequestConfirmationScene = new Scenes.BaseScene("DesignerRequestConfirmationScene");

designerRequestConfirmationScene.enter(async (ctx) => {
    // @ts-ignore
    let {first_name, last_name, phone, passport} = ctx.session;
    // @ts-ignore
    await ctx.replyWithPhoto(passport, {
        parse_mode: "HTML",
        // @ts-ignore
        caption: ctx.i18n.t("designer.confirmation.text", {first_name, last_name, phone: "", phone_in_telegram: phone}),
        // @ts-ignore
        ...designerConfirmationButtons(ctx.i18n)
    });
});

designerRequestConfirmationScene.on("text", async (ctx) => {
    // @ts-ignore
    let {first_name, last_name, phone, passport} = ctx.session;
    const designerRequestService = new DesignerRequestService();
    const userService = new UserService();
    // @ts-ignore
    if (ctx.message.text === ctx.i18n.t("designer.confirmation.i_confirm")) {
        // designerRequestService.createRequest()
        let user = await userService.getUserByTelegramId(ctx.from?.id);
        let userEdited = await userService.updateUser(user?.id, {
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            is_designer: false
        });
        if (userEdited == null) {
            await ctx.replyWithHTML("Nimadir xato bo'ldi");
            // @ts-ignore
            ctx.scene.reenter();
            return;
        }
        // @ts-ignore
        let designerRequest = await designerRequestService.createRequest(userEdited, "", passport);
        // @ts-ignore
        await ctx.replyWithHTML(ctx.i18n.t("designer.confirmation.i_confirmed"), menuButtons(ctx.i18n));
        // @ts-ignore
        await ctx.telegram.sendPhoto(process.env.BOT_ADMIN_ID, passport, {
            parse_mode: "HTML",
            // @ts-ignore
            caption: ctx.i18n.t("designer.confirmation.text", {
                first_name,
                last_name,
                phone: "",
                phone_in_telegram: phone
            }),
            // @ts-ignore
            ...designerConfirmationAdminButtons(ctx.i18n, designerRequest.id)
        });
        // @ts-ignore
    } else if (ctx.message.text === ctx.i18n.t("designer.confirmation.i_declined")) {
        // @ts-ignore
        await ctx.replyWithHTML(ctx.i18n.t("designer.confirmation.declined"), menuButtons(ctx.i18n));
    } else {
        // @ts-ignore
        await ctx.scene.reenter();
        return;
    }
    // @ts-ignore
    await ctx.scene.leave();
});

export {
    designerNameRequestScene,
    designerLastNameRequestScene,
    designerPhoneRequestScene,
    designerPassportRequestScene,
    designerRequestConfirmationScene
};
