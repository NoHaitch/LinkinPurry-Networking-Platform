import { App } from "./app";
import { PORT } from "./config";

const app = new App();

app.listen(parseInt(PORT, 10));
