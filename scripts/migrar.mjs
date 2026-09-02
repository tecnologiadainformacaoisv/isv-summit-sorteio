#!/usr/bin/env node
/**
 * Aplica os arquivos SQL numerados em db/*.sql, em ordem, contra o banco
 * apontado por DATABASE_URL (connection string do Postgres do Supabase,
 * geralmente a porta 5432 "direct connection", não a 6543 pooler, pois DDL
 * precisa de conexão direta).
 *
 * Uso:
 *   DATABASE_URL="postgres://..." node scripts/migrar.mjs
 *   DATABASE_URL="postgres://..." node scripts/migrar.mjs --seed   (inclui 03_seed_dev.sql)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbDir = join(__dirname, '..', 'db')
const incluirSeed = process.argv.includes('--seed')

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL não definida. Exporte a connection string direta (porta 5432) do Supabase.')
  process.exit(1)
}

const arquivos = readdirSync(dbDir)
  .filter((f) => f.endsWith('.sql'))
  .filter((f) => incluirSeed || !f.includes('seed'))
  .sort()

const client = new pg.Client({ connectionString: databaseUrl })

async function main() {
  await client.connect()
  for (const arquivo of arquivos) {
    console.log(`Aplicando ${arquivo}…`)
    const sql = readFileSync(join(dbDir, arquivo), 'utf-8')
    await client.query(sql)
  }
  console.log('Migração concluída.')
  await client.end()
}

main().catch((erro) => {
  console.error('Falha na migração:', erro.message)
  process.exit(1)
})
