/*
 * Heertz Bot - A multifunctional bot for Discord
 *  Copyright (C) 2021 RedsTom
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

import config from '../config/config.prod.js'
import c from './utils/ansi-colors.js'
import { Route, RouteType } from './utils/route.js'
import Database from './utils/database/database.js'
import { Terminal } from './utils/terminal.js'
import { DiscordTokenManager } from './utils/database/models/discord-token.js'

// Initialize the logger
const filePath = import.meta.url.split('/')
const fileName = filePath[filePath.length - 1]

const term = new Terminal(fileName)

// Connect to the database
export const database = new Database()
await database.connect()

while (!database.isConnected()) {
}

export const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const router = express.Router({
  caseSensitive: false
})

await registerRoutes()
term.info('All routes have been registered !')

app.use('/api/v1', router)

const port = config.backend.port || 5972
app.listen(port, () => {
  term.info(`Server started on port ${port} !`)
})

async function registerRoutes () {
  await registerRoute('./routes')
}

async function registerRoute (folder) {
  // Get all the files and folders into the actual folder
  const files = fs.readdirSync(new URL(folder, import.meta.url))

  // Check for all the files/folders in the actual folder
  for (const file of files) {
    // Check if the file isn't a javascript file
    if (!(file.endsWith('.js') || file.endsWith('.ts'))) {
      // Check if the file is a folder
      if (file.split('.').length === 1) {
        // Register all the routes in the folder
        await registerRoute(folder + '/' + file)
      }
      continue
    }

    // Import the file as a js module
    const cmdClass = await import(folder + '/' + file)

    if (!cmdClass.default) {
      term.warning(`Cannot handle file ${c.yellow}${folder}/${file}${c.reset} !`)
      continue
    }

    // Instantiate the current class
    const route = new cmdClass.default()

    if (!(route instanceof Route)) {
      term.error(`The file ${file} does not extends the Route class !`)
      continue
    }
    const infos = route.infos()

    // Register the route
    if (infos.prefixed === undefined ? true : infos.prefixed) {
      term.info(
        `Registered ${c.magenta}route${c.reset} ` +
        `${c.cyan}${infos.type.toUpperCase()} /api/v1${infos.route}${c.reset} ` +
        `in file ${c.yellow}${folder}/${file}`
      )
      router.route(infos.route)[infos.type || RouteType.Get](route.run)
    } else {
      term.info(
        `Registered ${c.magenta}route${c.reset} ` +
        `${c.cyan}${infos.type.toUpperCase()} ${infos.route}${c.reset} ` +
        `in file ${c.yellow}${folder}/${file}`
      )
      app.route(infos.route)[infos.type || RouteType.Get](route.run)
    }
  }
}
