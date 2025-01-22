import { FastifyInstance } from "fastify"
import { z } from "zod"
import { knex } from "../database"
import { randomUUID } from "crypto"

export function transactionsRoutes(app: FastifyInstance) {

    app.get("/", async (req, res) => {
        const transactions = await knex("transactions").select("*")
        return transactions
    })

    app.post("/", async (req, res) => {
        const createTransactionSchema = z.object({
            title: z.string().nonempty(),
            amount: z.number(),
            type: z.enum(["credit", "debit"]),
        })

        const { title, amount, type } = createTransactionSchema.parse(req.body)

        await knex("transactions").insert({
            id: randomUUID(),
            title,
            amount: type === "debit" ? amount * -1 : amount,
        })

        return res.status(201).send()
    })

}