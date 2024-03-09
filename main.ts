import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import data from "./data.json" with { type: "json" };
import { bold, yellow } from "https://deno.land/std@0.218.2/fmt/colors.ts";
import { db } from "./db.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Welcome to dinosaur API!";
  })
  .get("/api", async (context) => {
    const { result } = await db.dinausaurs.getMany();
    context.response.body = result.map((r) => r.value);
  })
  .get("/api/:dinosaur", async (context) => {
    if (context?.params?.dinosaur) {
      const found = await db.dinausaurs.findByPrimaryIndex(
        "lower",
        context.params.dinosaur.toLowerCase(),
      );

      if (found) {
        context.response.body = found.value;
      } else {
        context.response.body = "No dinosaur found.";
      }
    }
  }).get("/reset", async (context) => {
    await db.dinausaurs.deleteMany();
    await db.dinausaurs.addMany(
      data.map((d) => ({ lower: d.name.toLowerCase(), ...d })),
    );
    context.response.body = "Data reset.";
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", async ({ hostname, port, serverType }) => {
  console.info(
    bold(`Start listening on `) + yellow(`${hostname}:${port}`) +
      bold("  using HTTP server: " + yellow(serverType)),
  );

  const dinausaurs = await db.dinausaurs.count();

  if (dinausaurs === 0) {
    console.info("No dinosaurs found in the database, adding data...");
    await db.dinausaurs.addMany(
      data.map((d) => ({ lower: d.name.toLowerCase(), ...d })),
    );
    console.info("Data added to the database.");
  }
});

// see https://github.com/oakserver/oak/issues/483#issuecomment-1060109388
app.addEventListener("error", (e) => {
  console.error("Oak.error", e.error);
  console.error("Oak.filename", e.filename);
  console.error("Oak.message", e.message);
});

await app.listen({ port: 8000 });
