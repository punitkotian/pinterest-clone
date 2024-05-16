import connectDB from "./db/index.js";
import { app } from "./app.js";
import { PORT } from "./config.js";

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running at port: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error during initialization: ", error);
  }
})();
