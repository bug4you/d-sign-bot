import {Scenes} from "telegraf";
import {Keyboard} from "telegram-keyboard";
import consola from "consola";
import {CategoryService} from "../service/CategoryService";
import {
    designCategoryButtons,
    menuButtons,
    newDesignAdminConfirmationButtons,
    newDesignConfirmationButtons
} from "../utils/BotKeyboard";
import {DesignService} from "../service/DesignService";
import {UserService} from "../service/UserService";

const newDesignTitleScene = new Scenes.BaseScene("newDesignTitleScene");
newDesignTitleScene.enter(async (ctx) => {
    // @ts-ignore
    const i18n = ctx.i18n;
    await ctx.replyWithHTML(i18n.t("design.add.wizard.text"), Keyboard.remove());
    await ctx.replyWithHTML(i18n.t("design.add.wizard.name.prompt"));
});

newDesignTitleScene.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.newDesign = {
        title: ctx.message.text
    }
    // @ts-ignore
    await ctx.scene.enter("newDesignDescriptionScene");
});

newDesignTitleScene.on("message", async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

const newDesignDescriptionScene = new Scenes.BaseScene("newDesignDescriptionScene");
newDesignDescriptionScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("design.add.wizard.description.prompt"));
});

newDesignDescriptionScene.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.newDesign.description = ctx.message.text;
    // @ts-ignore
    await ctx.scene.enter("newDesignImageScene");
});

const newDesignImageScene = new Scenes.BaseScene("newDesignImageScene");
newDesignImageScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("design.add.wizard.image.prompt"));
});

newDesignImageScene.on("photo", async (ctx) => {
    // @ts-ignore
    const photo = ctx.message.photo[0];
    // @ts-ignore
    ctx.session.newDesign.image = photo.file_id;
    // @ts-ignore
    await ctx.scene.enter("newDesignPriceScene");
});

newDesignImageScene.on("message", async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

newDesignDescriptionScene.on("message", async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

const newDesignPriceScene = new Scenes.BaseScene("newDesignPriceScene");

newDesignPriceScene.enter(async (ctx) => {
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("design.add.wizard.price.prompt"));
});

newDesignPriceScene.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.newDesign.price = ctx.message.text;
    // @ts-ignore
    await ctx.scene.enter("newDesignCategoryScene");
});

newDesignPriceScene.on("message", async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

export const newDesignCategoryScene = new Scenes.BaseScene("newDesignCategoryScene");
newDesignCategoryScene.enter(async (ctx) => {
    const categoryService = new CategoryService();
    let categories = await categoryService.getAllCategories();
    if (categories.length === 0) {
        // @ts-ignore
        await ctx.replyWithHTML(ctx.i18n.t("design.add.wizard.category.empty"), menuButtons(ctx.i18n));
        // @ts-ignore
        return ctx.scene.leave();
    }
    // @ts-ignore
    await ctx.replyWithHTML(ctx.i18n.t("design.add.wizard.category.prompt"), designCategoryButtons(ctx.i18n, categories));
});

newDesignCategoryScene.on("text", async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

newDesignCategoryScene.on("callback_query", async (ctx) => {
    // @ts-ignore
    const categoryId = ctx.callbackQuery.data.split("_")[1];
    // @ts-ignore
    ctx.session.newDesign.categoryId = categoryId;
    try {
        await ctx.deleteMessage();
    } catch (e) {
        consola.error(e);
    }
    // @ts-ignore
    await ctx.scene.enter("newDesignConfirmationScene");
});

const newDesignConfirmationScene = new Scenes.BaseScene("newDesignConfirmationScene");

newDesignConfirmationScene.enter(async (ctx) => {
    // @ts-ignore
    const newDesign = ctx.session.newDesign;
    // @ts-ignore
    let i18n = ctx.i18n;
    await ctx.replyWithPhoto(newDesign.image, {
        caption: `${i18n.t("design.add.wizard.view.tag_title")} <i>${newDesign.title}</i>\n${i18n.t("design.add.wizard.view.tag_description")} <i>${newDesign.description}</i>\n${i18n.t("design.add.wizard.view.tag_price")} <i>${newDesign.price}</i>`,
        parse_mode: "HTML"
    });
    // @ts-ignore
    await ctx.replyWithHTML(i18n.t("design.add.wizard.view.check_info"), newDesignConfirmationButtons(i18n));
    // @ts-ignore
    ctx.scene.leave();
});

export {
    newDesignTitleScene,
    newDesignDescriptionScene,
    newDesignPriceScene,
    newDesignConfirmationScene,
    newDesignImageScene
};