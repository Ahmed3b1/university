#!/usr/bin/env node
/**
 * EduLrn - create (or promote) an administrator account.
 *
 * Usage (from the project root, after creating .env.local):
 *
 *   npm run create-admin
 *   npm run create-admin -- --name "Jane Doe" --email jane@example.com --password "Str0ngPass1"
 *   npm run create-admin -- --email existing.user@example.com --yes      (promote an existing user)
 *
 * The password rules are the same as the sign-up form:
 *   at least 8 characters, one uppercase letter and one number.
 *
 * Requires Node.js 20.6+ (it reads .env.local through Node's --env-file flag,
 * see the "create-admin" entry in package.json).
 */
import readline from 'node:readline'
import { Writable } from 'node:stream'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const BCRYPT_ROUNDS = 12 // must match src/lib/password.ts

// ---------- tiny helpers ----------
const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    if (key === 'yes' || key === 'help') {
      out[key] = true
    } else {
      out[key] = argv[i + 1]
      i++
    }
  }
  return out
}

let muted = false
const mutableOutput = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding)
    callback()
  },
})

function ask(rl, question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    process.stdout.write(question)
    muted = hidden
    rl.question('', (answer) => {
      muted = false
      if (hidden) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

function validate({ name, email, password }) {
  const errors = []
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.')
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please enter a valid email address.')
  if (password !== undefined) {
    if (password.length < 8) errors.push('Password must be at least 8 characters.')
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter.')
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number.')
  }
  return errors
}

function explainConnectionError(err) {
  const msg = String(err?.message || err)
  if (/bad auth|Authentication failed/i.test(msg)) {
    return 'Authentication failed. Check the username and password inside MONGODB_URI (special characters in the password must be URL-encoded, e.g. @ becomes %40).'
  }
  if (/ENOTFOUND|querySrv|Invalid scheme|Invalid connection string/i.test(msg)) {
    return 'The connection string looks invalid. Copy it again from MongoDB Atlas (Connect > Drivers) and paste it without quotes.'
  }
  if (/whitelist|not whitelisted|Could not connect to any servers|ReplicaSetNoPrimary|ServerSelection|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(msg)) {
    return 'Could not reach the database. In MongoDB Atlas open Security > Network Access and allow your IP address (or 0.0.0.0/0), then try again.'
  }
  return msg
}

// ---------- main ----------
async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log('Usage: npm run create-admin -- [--name "Full Name"] [--email you@example.com] [--password "Passw0rd"] [--yes]')
    return 0
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error(c.red('MONGODB_URI is not set.'))
    console.error('Create a .env.local file in the project root (see .env.example) and run this command through "npm run create-admin".')
    return 1
  }

  const interactive = process.stdin.isTTY && !(args.name && args.email && args.password)
  const rl = readline.createInterface({ input: process.stdin, output: mutableOutput, terminal: true })

  try {
    let { name, email, password } = args
    const hasArgsOnly = Boolean(args.email) && !args.password && args.yes // promote flow without password

    if (!args.email) email = await ask(rl, 'Admin email: ')
    email = (email || '').trim().toLowerCase()

    console.log(c.dim('\nConnecting to MongoDB...'))
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    } catch (err) {
      console.error(c.red('\nConnection failed: ') + explainConnectionError(err))
      return 1
    }
    const users = mongoose.connection.collection('users')
    console.log(c.dim(`Connected to database "${mongoose.connection.name}".\n`))

    const existing = await users.findOne({ email })

    // ----- Existing account: promote -----
    if (existing) {
      if (existing.role === 'admin') {
        console.log(c.green(`${email} is already an administrator. Nothing to do.`))
        return 0
      }
      let confirmed = Boolean(args.yes)
      if (!confirmed) {
        if (!interactive) {
          console.error(c.red(`An account with ${email} already exists (role: ${existing.role}). Re-run with --yes to promote it to admin.`))
          return 1
        }
        const answer = await ask(rl, `An account with ${email} already exists (role: ${existing.role}). Promote it to admin? (y/N): `)
        confirmed = /^y(es)?$/i.test(answer)
      }
      if (!confirmed) {
        console.log('Cancelled. No changes were made.')
        return 0
      }
      await users.updateOne({ _id: existing._id }, { $set: { role: 'admin', updatedAt: new Date() } })
      console.log(c.green(`\n${existing.name || email} (${email}) is now an administrator.`))
      console.log(c.dim('Their password was not changed. Log out and log in again so the new role takes effect.'))
      return 0
    }

    // ----- New account -----
    if (hasArgsOnly) {
      console.error(c.red(`No account with ${email} exists. Provide --name and --password to create one.`))
      return 1
    }
    if (!name) name = await ask(rl, 'Full name: ')
    if (!password) {
      if (!interactive) {
        console.error(c.red('Password is required (use --password or run the command in an interactive terminal).'))
        return 1
      }
      password = await ask(rl, 'Password (hidden): ', { hidden: true })
      const confirm = await ask(rl, 'Confirm password: ', { hidden: true })
      if (password !== confirm) {
        console.error(c.red('Passwords do not match.'))
        return 1
      }
    }

    const problems = validate({ name, email, password })
    if (problems.length) {
      console.error(c.red('\nPlease fix the following:'))
      problems.forEach((p) => console.error(` - ${p}`))
      return 1
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const now = new Date()
    await users.insertOne({
      name: name.trim(),
      email,
      password: hashed,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })

    console.log(c.green(`\nAdministrator created: ${name.trim()} (${email})`))
    console.log('You can now log in at /login.')
    return 0
  } catch (err) {
    console.error(c.red('\nUnexpected error: ') + explainConnectionError(err))
    return 1
  } finally {
    rl.close()
    await mongoose.disconnect().catch(() => {})
  }
}

main().then((code) => process.exit(code))
