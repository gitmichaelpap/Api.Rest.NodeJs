import { FastifyInstance } from "fastify"
import { knex } from "../database"

export function transactionsRoutes(app: FastifyInstance) {
    app.get("/", async () => {
        const transactions = await knex("transactions").where("amount", 100).select("*")

        return transactions
    })
}