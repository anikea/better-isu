import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely"
import { promises as fs } from "fs"
import * as path from "path"
import { PostgresJSDialect } from "kysely-postgres-js"
import postgres from 'postgres'

import "dotenv/config"

async function migrate() {
	const db = new Kysely<any>({
		dialect: new PostgresJSDialect({
			postgres: postgres({
				host: process.env.DB_HOST,
				username: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME,
			})
		})
	})
	const migrator = new Migrator({
		db: db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, 'migrations'),
		})
	})
	const { error, results } = await migrator.migrateToLatest()

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`)
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`)
		}
	})

	if (error) {
		console.error('failed to migrate')
		console.error(error)
		process.exit(1)
	}


	await db.destroy()

}

migrate()
