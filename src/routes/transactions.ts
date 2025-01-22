import { FastifyInstance } from "fastify"
import { z } from "zod"
import { knex } from "../database"
import { randomUUID } from "crypto"

export function transactionsRoutes(app: FastifyInstance) {

    app.get("/", async (_, res) => {
        const transactions = await knex("transactions").select("*")
        return res.status(200).send({ transactions })
    })

    app.get("/:id", async (req, res) => {
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getTransactionParamsSchema.parse(req.params)

        const transaction = await knex("transactions").where({ id }).first()

        if (!transaction) {
            return res.status(404).send()
        }

        return res.status(200).send({ transaction })
    })

    app.get("/summary", async (req, res) => {

        const summary = await knex("transactions").sum("amount", { as: 'amount' }).first()

        if (!summary) {
            return res.status(404).send()
        }

        return res.status(200).send({ summary })
    })

    app.post("/", async (req, res) => {
        const createTransactionSchema = z.object({
            title: z.string().nonempty(),
            amount: z.number(),
            type: z.enum(["credit", "debit"]),
        })

        const { title, amount, type } = createTransactionSchema.parse(req.body)

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === "debit" ? amount * -1 : amount,
        })

        return res.status(201).send()
    })

}