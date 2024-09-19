import {DataSource} from "typeorm";
import {User} from "./entity/User";
import {DesignerRequest} from "./entity/DesignerRequest";
import {Category} from "./entity/Category";
import {Design} from "./entity/Design";
import {Cart} from "./entity/Cart";
import {Order} from "./entity/Order";
import {OrderItem} from "./entity/OrderItem";
import {UserLanguage} from "./entity/UserLanguage";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [
        User,
        DesignerRequest,
        Category,
        Design,
        Cart,
        Order,
        OrderItem,
        UserLanguage,
    ],
    synchronize: true,
    logging: true,
});
