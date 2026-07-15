import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const workspaceRoot = process.cwd()

function readFilesRecursively(directory: string, predicate: (filePath: string) => boolean): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry)
      const stat = statSync(path)

      if (stat.isDirectory()) {
        return readFilesRecursively(path, predicate)
      }

      return predicate(path) ? readFileSync(path, 'utf8') : ''
    })
    .join('\n')
}

describe('securite frontend et Supabase', () => {
  it('ne versionne pas de secret frontend et ne reference pas service_role', () => {
    const frontendSource = readFilesRecursively(
      join(workspaceRoot, 'src'),
      (filePath) => /\.(ts|tsx)$/.test(filePath) && !/\.test\.(ts|tsx)$/.test(filePath),
    )
    const envExample = readFileSync(join(workspaceRoot, '.env.example'), 'utf8')
    const gitignore = readFileSync(join(workspaceRoot, '.gitignore'), 'utf8')

    expect(frontendSource).not.toMatch(/service_role|SERVICE_ROLE|VITE_SUPABASE_SERVICE/)
    expect(envExample).toBe('VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\n')
    expect(gitignore).toContain('.env')
    expect(gitignore).toContain('!.env.example')
  })

  it('ne modifie pas directement child_accounts.balance depuis React', () => {
    const reactSource = readFilesRecursively(
      join(workspaceRoot, 'src'),
      (filePath) => /\.tsx$/.test(filePath) && !/\.test\.tsx$/.test(filePath),
    )
    const serviceSource = readFilesRecursively(
      join(workspaceRoot, 'src'),
      (filePath) => /services[\\/].*\.ts$/.test(filePath) && !/\.test\.ts$/.test(filePath),
    )

    expect(reactSource).not.toMatch(/from\(['"]child_accounts['"]\)\s*\.update/s)
    expect(serviceSource).not.toMatch(/from\(['"]child_accounts['"]\)\s*\.update/s)
    expect(serviceSource).toMatch(/rpc\(['"]create_child_transaction['"]/)
  })

  it('garde RLS active et les RPC securisees dans la migration', () => {
    const migration = readFileSync(join(workspaceRoot, 'supabase', 'migrations', '001_initial_schema.sql'), 'utf8')

    expect(migration).toMatch(/alter table public\.child_accounts enable row level security/i)
    expect(migration).toMatch(/alter table public\.transactions enable row level security/i)
    expect(migration).toMatch(/create or replace function public\.create_child_transaction[\s\S]*security definer[\s\S]*set search_path = public, pg_temp/i)
    expect(migration).toMatch(/revoke execute on function public\.create_child_transaction/i)
    expect(migration).toMatch(/p\.family_id = public\.current_family_id\(\)/)
  })
})
