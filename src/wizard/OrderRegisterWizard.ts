import {Scenes} from "telegraf";
import consola from "consola";
import {UserService} from "../service/UserService";
import {OrderService} from "../service/OrderService";
import {CartService} from "../service/CartService";
import {OrderItemService} from "../service/OrderItemService";
import {menuButtons} from "../utils/BotKeyboard";

const userRegisterFirstName = new Scenes.BaseScene<Scenes.SceneContext>("userRegisterFirstName");

userRegisterFirstName.enter(async (ctx) => {
    // @ts-ignore
    ctx.session.user = {};
    await ctx.reply("What is your first name?");
});

userRegisterFirstName.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.user = {
        first_name: ctx.message.text
    };
    await ctx.scene.enter("userRegisterLastName");
});

userRegisterFirstName.on("message", async (ctx) => {
    await ctx.scene.reenter();
});

const userRegisterLastName = new Scenes.BaseScene<Scenes.SceneContext>("userRegisterLastName");

userRegisterLastName.enter(async (ctx) => {
    await ctx.reply("What is your last name?");
});

userRegisterLastName.on("text", async (ctx) => {
    // @ts-ignore
    ctx.session.user = {
        // @ts-ignore
        ...ctx.session.user,
        last_name: ctx.message.text
    };
    console.log(ctx.message.text);
    await ctx.scene.enter("userRegisterPhone");
});

userRegisterLastName.on("message", async (ctx) => {
    await ctx.scene.reenter();
});

const userRegisterPhone = new Scenes.BaseScene<Scenes.SceneContext>("userRegisterPhone");

userRegisterPhone.enter(async (ctx) => {
    // @ts-ignore
    await ctx.reply("What is your phone number?", {
        reply_markup: {
            keyboard: [
                [{text: "Share phone number", request_contact: true}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

userRegisterPhone.on("contact", async (ctx) => {
    console.clear();
    consola.success(ctx.message.contact.phone_number);

    const userService = new UserService();
    const orderService = new OrderService();
    const cartService = new CartService();
    const userCarts = await cartService.getUserCart(ctx.from.id.toString());
    let user = await userService.getUserByTelegramId(ctx.from.id);
    // @ts-ignore
    const order = await orderService.createOrder(user, ctx.session.user.first_name + ctx.session.user.last_name, ctx.message.contact.phone_number);
    await ctx.reply(`Order created: ${order.id}`);

    const orderItemService = new OrderItemService();
    for (const cart of userCarts) {
        await orderItemService.createOrderItem(order, cart.design, cart.quantity);
    }

    // Buyurtma tugadi
    // @ts-ignore
    await ctx.reply("Buyurtma tasdiqlandi. Buyurtma raqami: " + order.id, menuButtons(ctx.i18n));
    await cartService.clearUserCart(ctx.from.id.toString());
    await ctx.scene.leave();
});

userRegisterPhone.on(["photo", "audio", "sticker", "document", "video", "edited_message"], async (ctx) => {
    // @ts-ignore
    await ctx.scene.reenter();
});

export {userRegisterFirstName, userRegisterLastName, userRegisterPhone};