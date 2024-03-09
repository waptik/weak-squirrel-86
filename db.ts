import { z } from "npm:zod";
import { zodModel } from "@olli/kvdex/ext/zod";
import { collection, kvdex } from "@olli/kvdex";

const DinosaurSchema = z.object({
  name: z.string(),
  lower: z.string(),
  description: z.string(),
});

const kv = await Deno.openKv();

export const db = kvdex(kv, {
  dinausaurs: collection(zodModel(DinosaurSchema), {
    indices: {
      lower: "primary",
    },
  }),
});
