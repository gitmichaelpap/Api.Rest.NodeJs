import { FastifyInstance } from "fastify"
import { z } from "zod"
import { randomUUID } from "crypto"
import { knex } from "../database"
import { checkSessionIdExist } from "../middlewares/check-session-id-exist"

export function transactionsRoutes(app: FastifyInstance) {

    app.get(
        "/",
        {
            preHandler: [checkSessionIdExist]
        },
        async (req, res) => {
            const { sessionId } = req.cookies
            const transactions = await knex("transactions")
                .where({ session_id: sessionId })
                .select("*")
            return res.status(200).send({ transactions })
        })

    app.get(
        "/:id", {
        preHandler: [checkSessionIdExist]
    },
        async (req, res) => {
            const getTransactionParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionParamsSchema.parse(req.params)
            const { sessionId } = req.cookies

            const transaction = await knex("transactions").where({ id, session_id: sessionId }).first()

            if (!transaction) {
                return res.status(404).send()
            }

            return res.status(200).send({ transaction })
        })

    app.get(
        "/summary", {
        preHandler: [checkSessionIdExist]
    },
        async (req, res) => {
            const { sessionId } = req.cookies

            const summary = await knex("transactions").where({ session_id: sessionId }).sum("amount", { as: 'amount' }).first()

            if (!summary) {
                return res.status(404).send()
            }

            return res.status(200).send({ summary })
        })

    app.post(
        "/",
        async (req, res) => {
            const createTransactionSchema = z.object({
                title: z.string().nonempty(),
                amount: z.number(),
                type: z.enum(["credit", "debit"]),
            })

            const { title, amount, type } = createTransactionSchema.parse(req.body)


            let sesssionId = req.cookies.sessionId

            if (!sesssionId) {
                sesssionId = randomUUID()

                res.cookie('sessionId', sesssionId, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                })
            }

            await knex('transactions').insert({
                id: randomUUID(),
                title,
                amount: type === "debit" ? amount * -1 : amount,
                session_id: sesssionId
            })

            return res.status(201).send()
        })

}